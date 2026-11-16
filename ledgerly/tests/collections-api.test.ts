import { afterEach, describe, expect, it } from "vitest";
import { POST as postNote } from "@/app/api/customers/[id]/notes/route";
import { POST as postNudge } from "@/app/api/invoices/[id]/nudge/route";
import { POST as postPayment } from "@/app/api/invoices/[id]/payments/route";
import { PATCH as patchNote } from "@/app/api/notes/[id]/route";
import { DEMO_AS_OF } from "@/lib/clock";
import { PLAN_PRICE_CENTS } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

// Alder BioSystems: one OVERDUE Scale invoice in the seed.
const CUSTOMER_ID = "cus_alderbio";
const INVOICE_ID = "inv_2003";

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const json = (body: unknown) =>
  new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

afterEach(async () => {
  await prisma.activity.deleteMany({ where: { customerId: CUSTOMER_ID } });
  await prisma.collectionNote.deleteMany({ where: { customerId: CUSTOMER_ID } });
  await prisma.payment.deleteMany({ where: { invoiceId: INVOICE_ID } });
  await prisma.invoice.update({ where: { id: INVOICE_ID }, data: { status: "OVERDUE", paidOn: null } });
  await prisma.customer.update({
    where: { id: CUSTOMER_ID },
    data: { email: "finance@alderbio.example" },
  });
});

describe("payments", () => {
  it("records the full outstanding balance and marks the invoice PAID", async () => {
    const response = await postPayment(json({ method: "ach" }), params(INVOICE_ID));
    expect(response.status).toBe(201);

    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: INVOICE_ID },
      include: { payments: true, activities: true },
    });
    expect(invoice.status).toBe("PAID");
    expect(invoice.paidOn).toEqual(DEMO_AS_OF);
    expect(invoice.payments).toMatchObject([{ amountCents: PLAN_PRICE_CENTS.SCALE, method: "ach", recordedBy: "Avery Quinn" }]);
    expect(invoice.activities).toMatchObject([
      { type: "PAYMENT_RECORDED", status: "recorded", amountCents: PLAN_PRICE_CENTS.SCALE, method: "ach", actorName: "Avery Quinn" },
    ]);

    const again = await postPayment(json({ method: "cash" }), params(INVOICE_ID));
    expect(again.status).toBe(400);
    expect(await prisma.payment.count({ where: { invoiceId: INVOICE_ID } })).toBe(1);
  });

  it("rejects an amount that is not the outstanding balance and an unknown method", async () => {
    const partial = await postPayment(json({ method: "check", amountCents: 4900 }), params(INVOICE_ID));
    expect(partial.status).toBe(400);
    const wire = await postPayment(json({ method: "wire" }), params(INVOICE_ID));
    expect(wire.status).toBe(400);

    const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: INVOICE_ID }, include: { payments: true } });
    expect(invoice.status).toBe("OVERDUE");
    expect(invoice.payments).toHaveLength(0);
    expect(await prisma.activity.count({ where: { invoiceId: INVOICE_ID } })).toBe(0);
  });
});

describe("collection notes", () => {
  it("saves a note tied to an invoice and logs NOTE_ADDED; blank bodies are rejected", async () => {
    const blank = await postNote(json({ body: "   " }), params(CUSTOMER_ID));
    expect(blank.status).toBe(400);

    const response = await postNote(json({ body: "Promised ACH Friday.", invoiceId: INVOICE_ID }), params(CUSTOMER_ID));
    expect(response.status).toBe(201);
    const { note } = (await response.json()) as { note: { id: string } };

    const stored = await prisma.collectionNote.findUniqueOrThrow({ where: { id: note.id }, include: { activities: true } });
    expect(stored).toMatchObject({ invoiceId: INVOICE_ID, authorName: "Avery Quinn", body: "Promised ACH Friday." });
    expect(stored.activities).toMatchObject([{ type: "NOTE_ADDED", customerId: CUSTOMER_ID, invoiceId: INVOICE_ID }]);
  });

  it("allows the author to edit within 15 minutes and refuses later or other authors", async () => {
    const fresh = await prisma.collectionNote.create({
      data: { customerId: CUSTOMER_ID, authorName: "Avery Quinn", body: "Called AP." },
    });
    const ok = await patchNote(json({ body: "Called AP, left voicemail." }), params(fresh.id));
    expect(ok.status).toBe(200);
    expect((await prisma.collectionNote.findUniqueOrThrow({ where: { id: fresh.id } })).body).toBe(
      "Called AP, left voicemail.",
    );

    const stale = await prisma.collectionNote.create({
      data: {
        customerId: CUSTOMER_ID,
        authorName: "Avery Quinn",
        body: "Old note.",
        createdAt: new Date(Date.now() - 16 * 60_000),
      },
    });
    const other = await prisma.collectionNote.create({
      data: { customerId: CUSTOMER_ID, authorName: "Sam Ortez", body: "Not Avery's." },
    });
    for (const note of [stale, other]) {
      const response = await patchNote(json({ body: "Rewritten." }), params(note.id));
      expect(response.status).toBe(403);
      expect((await prisma.collectionNote.findUniqueOrThrow({ where: { id: note.id } })).body).toBe(note.body);
    }
  });
});

describe("nudge", () => {
  it("logs a sent NUDGE_SENT by email with the fixed template", async () => {
    const response = await postNudge(json({}), params(INVOICE_ID));
    expect(response.status).toBe(201);
    const body = (await response.json()) as { activity: Record<string, unknown>; message: string };
    expect(body.activity).toMatchObject({
      type: "NUDGE_SENT",
      status: "sent",
      channel: "email",
      actorName: "Avery Quinn",
      recipient: "finance@alderbio.example",
      invoiceId: INVOICE_ID,
    });
    expect(body.message).toContain("INV-2003");
    expect(body.message).toContain("$249.00");
    expect(body.message).toContain("Aug 4, 2026");
  });

  it("logs a failed NUDGE_SENT when the email on file is not an address", async () => {
    await prisma.customer.update({ where: { id: CUSTOMER_ID }, data: { email: "call the front desk" } });
    const response = await postNudge(json({}), params(INVOICE_ID));
    expect(response.status).toBe(201);
    const stored = await prisma.activity.findMany({ where: { invoiceId: INVOICE_ID, type: "NUDGE_SENT" } });
    expect(stored).toMatchObject([{ status: "failed", channel: "email" }]);
  });

  it("refuses to nudge an invoice that is not overdue", async () => {
    const response = await postNudge(json({}), params("inv_1041"));
    expect(response.status).toBe(400);
  });
});
