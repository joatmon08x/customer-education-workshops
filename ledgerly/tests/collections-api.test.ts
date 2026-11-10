import { afterAll, afterEach, describe, expect, it } from "vitest";
import { POST as postNote } from "@/app/api/customers/[id]/notes/route";
import { POST as postNudge } from "@/app/api/invoices/[id]/nudge/route";
import { POST as postPayment } from "@/app/api/invoices/[id]/payments/route";
import * as noteRoute from "@/app/api/notes/[id]/route";
import { DEMO_AS_OF } from "@/lib/clock";
import { PLAN_PRICE_CENTS } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

// Seeded overdue Scale accounts from prisma/extra-accounts.ts.
const ALDER = { customerId: "cus_alderbio", invoiceId: "inv_2003", email: "finance@alderbio.example" };
const BLUE_HARBOR = { customerId: "cus_blueharbor", invoiceId: "inv_2009", email: "vendors@blueharborbank.example" };

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const json = (body: unknown, method = "POST") =>
  new Request("http://localhost/api", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

async function restore() {
  for (const account of [ALDER, BLUE_HARBOR]) {
    await prisma.activity.deleteMany({ where: { customerId: account.customerId } });
    await prisma.collectionNote.deleteMany({ where: { customerId: account.customerId } });
    await prisma.payment.deleteMany({ where: { invoiceId: account.invoiceId } });
    await prisma.invoice.update({ where: { id: account.invoiceId }, data: { status: "OVERDUE", paidOn: null } });
    await prisma.customer.update({ where: { id: account.customerId }, data: { email: account.email } });
  }
}

afterEach(restore);
afterAll(() => prisma.$disconnect());

describe("POST /api/invoices/[id]/payments", () => {
  it("records the full outstanding balance and marks the invoice PAID", async () => {
    const response = await postPayment(json({ method: "ach" }), params(ALDER.invoiceId));
    expect(response.status).toBe(201);

    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: ALDER.invoiceId },
      include: { payments: true, activities: true },
    });
    expect(invoice.status).toBe("PAID");
    expect(invoice.paidOn?.toISOString()).toBe(DEMO_AS_OF.toISOString());
    expect(invoice.payments).toMatchObject([{ amountCents: PLAN_PRICE_CENTS.SCALE, method: "ach", recordedBy: "Avery Quinn" }]);
    expect(invoice.activities).toMatchObject([
      { type: "PAYMENT_RECORDED", status: "recorded", amountCents: PLAN_PRICE_CENTS.SCALE, method: "ach", actorName: "Avery Quinn" },
    ]);
  });

  it("rejects a payment once nothing is outstanding", async () => {
    await postPayment(json({ method: "cash" }), params(ALDER.invoiceId));
    const response = await postPayment(json({ method: "cash" }), params(ALDER.invoiceId));
    expect(response.status).toBe(400);
    expect(await prisma.payment.count({ where: { invoiceId: ALDER.invoiceId } })).toBe(1);
  });

  it("rejects an amount that is not the outstanding balance and stores nothing", async () => {
    const response = await postPayment(json({ method: "check", amountCents: 9900 }), params(ALDER.invoiceId));
    expect(response.status).toBe(400);
    const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: ALDER.invoiceId }, include: { payments: true } });
    expect(invoice.status).toBe("OVERDUE");
    expect(invoice.payments).toHaveLength(0);
    expect(await prisma.activity.count({ where: { customerId: ALDER.customerId } })).toBe(0);
  });

  it("rejects a method outside the catalog of payment types", async () => {
    const response = await postPayment(json({ method: "wire" }), params(ALDER.invoiceId));
    expect(response.status).toBe(400);
  });
});

describe("collection notes", () => {
  it("saves a note tied to an invoice with a NOTE_ADDED activity", async () => {
    const response = await postNote(
      json({ body: "Promised payment Friday.", invoiceId: ALDER.invoiceId }),
      params(ALDER.customerId),
    );
    expect(response.status).toBe(201);
    const { note } = await response.json();
    expect(note).toMatchObject({ authorName: "Avery Quinn", invoiceId: ALDER.invoiceId, body: "Promised payment Friday." });
    const activity = await prisma.activity.findUniqueOrThrow({ where: { noteId: note.id } });
    expect(activity).toMatchObject({ type: "NOTE_ADDED", customerId: ALDER.customerId, actorName: "Avery Quinn" });
  });

  it("rejects a blank body", async () => {
    const response = await postNote(json({ body: "   " }), params(ALDER.customerId));
    expect(response.status).toBe(400);
    expect(await prisma.collectionNote.count({ where: { customerId: ALDER.customerId } })).toBe(0);
  });

  it("lets Avery edit a fresh note", async () => {
    const { note } = await (await postNote(json({ body: "First draft" }), params(ALDER.customerId))).json();
    const response = await noteRoute.PATCH(json({ body: "Corrected" }, "PATCH"), params(note.id));
    expect(response.status).toBe(200);
    expect((await prisma.collectionNote.findUniqueOrThrow({ where: { id: note.id } })).body).toBe("Corrected");
  });

  it("refuses edits after 15 minutes or by another author, and has no delete route", async () => {
    const old = await prisma.collectionNote.create({
      data: {
        customerId: ALDER.customerId,
        authorName: "Avery Quinn",
        body: "Old note",
        createdAt: new Date(Date.now() - 16 * 60 * 1000),
      },
    });
    const other = await prisma.collectionNote.create({
      data: { customerId: ALDER.customerId, authorName: "Another operator", body: "Their note" },
    });

    expect((await noteRoute.PATCH(json({ body: "x" }, "PATCH"), params(old.id))).status).toBe(403);
    expect((await noteRoute.PATCH(json({ body: "x" }, "PATCH"), params(other.id))).status).toBe(403);
    expect((await prisma.collectionNote.findUniqueOrThrow({ where: { id: old.id } })).body).toBe("Old note");
    expect("DELETE" in noteRoute).toBe(false);
  });
});

describe("POST /api/invoices/[id]/nudge", () => {
  it("logs NUDGE_SENT by email with the fixed template", async () => {
    const response = await postNudge(new Request("http://localhost/api", { method: "POST" }), params(BLUE_HARBOR.invoiceId));
    expect(response.status).toBe(201);
    const { activity } = await response.json();
    expect(activity).toMatchObject({
      type: "NUDGE_SENT",
      status: "sent",
      channel: "email",
      actorName: "Avery Quinn",
      recipient: BLUE_HARBOR.email,
      invoiceId: BLUE_HARBOR.invoiceId,
    });
    expect(activity.message).toContain("INV-2009");
    expect(activity.message).toContain("$249.00");
    expect(activity.message).toContain("Aug 4, 2026");
  });

  it("logs a failed NUDGE_SENT when the address cannot be emailed", async () => {
    await prisma.customer.update({ where: { id: BLUE_HARBOR.customerId }, data: { email: "not-an-address" } });
    const response = await postNudge(new Request("http://localhost/api", { method: "POST" }), params(BLUE_HARBOR.invoiceId));
    expect(response.status).toBe(201);
    const { activity } = await response.json();
    expect(activity).toMatchObject({ type: "NUDGE_SENT", status: "failed", channel: "email" });
    expect(await prisma.activity.count({ where: { customerId: BLUE_HARBOR.customerId, status: "failed" } })).toBe(1);
  });

  it("refuses to nudge an invoice that is not overdue", async () => {
    const response = await postNudge(new Request("http://localhost/api", { method: "POST" }), params("inv_1042"));
    expect(response.status).toBe(400);
  });
});
