import { afterEach, describe, expect, it } from "vitest";
import { POST as postNudge } from "@/app/api/invoices/[id]/nudge/route";
import { DEMO_AS_OF } from "@/lib/clock";
import { formatDate } from "@/lib/dates";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { formatUsd } from "@/lib/money";
import {
  ACTIVITY_STATUS_SENT,
  ACTIVITY_TYPE_NUDGE_SENT,
  NUDGE_CHANNEL_EMAIL,
  nudgeTemplate,
} from "@/lib/nudge";
import { prisma } from "@/lib/prisma";

const params = (id: string) => ({ params: Promise.resolve({ id }) });

function nudgeRequest(invoiceId: string, body?: unknown) {
  if (body === undefined) {
    return new Request(`http://localhost/api/invoices/${invoiceId}/nudge`, { method: "POST" });
  }
  return new Request(`http://localhost/api/invoices/${invoiceId}/nudge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const overdueInvoiceId = "inv_1043";
const paidInvoiceId = "inv_1042";

async function restoreNudge(invoiceId: string) {
  await prisma.activity.deleteMany({
    where: { invoiceId, type: ACTIVITY_TYPE_NUDGE_SENT },
  });
  if (invoiceId === overdueInvoiceId) {
    await prisma.invoice.update({
      where: { id: overdueInvoiceId },
      data: { status: "OVERDUE", paidOn: null },
    });
  }
}

describe("nudgeTemplate", () => {
  it("names the invoice number, outstanding balance, and due date", () => {
    const dueOn = new Date("2026-08-12T12:00:00.000Z");
    const copy = nudgeTemplate({
      number: "INV-1047",
      dueOn,
      outstandingCents: 9900,
    });

    expect(copy).toContain("INV-1047");
    expect(copy).toContain(formatUsd(9900));
    expect(copy).toContain(formatDate(dueOn));
  });
});

describe("POST /api/invoices/[id]/nudge", () => {
  afterEach(async () => {
    await restoreNudge(overdueInvoiceId);
  });

  it("logs NUDGE_SENT as email from Avery Quinn with the fixed template", async () => {
    await restoreNudge(overdueInvoiceId);

    const response = await postNudge(nudgeRequest(overdueInvoiceId), params(overdueInvoiceId));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.activity).toMatchObject({
      customerId: "cus_quarrypine",
      invoiceId: overdueInvoiceId,
      type: ACTIVITY_TYPE_NUDGE_SENT,
      status: ACTIVITY_STATUS_SENT,
      actorName: DEMO_OPERATOR.name,
      channel: NUDGE_CHANNEL_EMAIL,
      amountCents: 24900,
    });
    expect(body.activity.body).toBe(
      nudgeTemplate({
        number: "INV-1043",
        dueOn: new Date("2026-08-09T12:00:00.000Z"),
        outstandingCents: 24900,
      }),
    );
    expect(new Date(body.activity.occurredOn).toISOString()).toBe(DEMO_AS_OF.toISOString());

    const stored = await prisma.activity.findFirst({
      where: { invoiceId: overdueInvoiceId, type: ACTIVITY_TYPE_NUDGE_SENT },
    });
    expect(stored).toMatchObject({
      status: ACTIVITY_STATUS_SENT,
      channel: NUDGE_CHANNEL_EMAIL,
      actorName: DEMO_OPERATOR.name,
    });
  });

  it("returns 400 and stores nothing when the invoice is not overdue", async () => {
    const before = await prisma.activity.count({ where: { invoiceId: paidInvoiceId } });

    const response = await postNudge(nudgeRequest(paidInvoiceId), params(paidInvoiceId));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invoice is not overdue" });
    expect(await prisma.activity.count({ where: { invoiceId: paidInvoiceId } })).toBe(before);
  });

  it("ignores a client-supplied body and still uses the fixed template", async () => {
    await restoreNudge(overdueInvoiceId);

    const response = await postNudge(
      nudgeRequest(overdueInvoiceId, { body: "Please pay extra." }),
      params(overdueInvoiceId),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.activity.body).toContain("INV-1043");
    expect(payload.activity.body).not.toContain("Please pay extra.");
  });
});
