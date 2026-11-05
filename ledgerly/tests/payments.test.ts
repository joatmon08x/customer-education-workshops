import { afterEach, describe, expect, it } from "vitest";
import { POST as postPayment } from "@/app/api/invoices/[id]/payments/route";
import { DEMO_AS_OF } from "@/lib/clock";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import {
  ACTIVITY_STATUS_RECORDED,
  ACTIVITY_TYPE_PAYMENT_RECORDED,
  outstandingBalanceCents,
  recordPaymentConfirmCopy,
} from "@/lib/payments";
import { prisma } from "@/lib/prisma";

const params = (id: string) => ({ params: Promise.resolve({ id }) });

function paymentRequest(body: unknown) {
  return new Request("http://localhost/api/invoices/inv_1047/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const overdueInvoiceId = "inv_1047";
const paidInvoiceId = "inv_1042";

async function restoreOverdueInvoice() {
  await prisma.activity.deleteMany({ where: { invoiceId: overdueInvoiceId } });
  await prisma.payment.deleteMany({ where: { invoiceId: overdueInvoiceId } });
  await prisma.invoice.update({
    where: { id: overdueInvoiceId },
    data: { status: "OVERDUE", paidOn: null },
  });
}

describe("outstandingBalanceCents", () => {
  it("uses totalCents until a payment is recorded", () => {
    expect(
      outstandingBalanceCents({ status: "OVERDUE", totalCents: 9900, payments: [] }),
    ).toBe(9900);
  });

  it("is 0 for a PAID invoice with no payment rows", () => {
    expect(outstandingBalanceCents({ status: "PAID", totalCents: 4900 })).toBe(0);
  });

  it("subtracts recorded payments from totalCents", () => {
    expect(
      outstandingBalanceCents({
        status: "OVERDUE",
        totalCents: 9900,
        payments: [{ amountCents: 9900 }],
      }),
    ).toBe(0);
  });
});

describe("POST /api/invoices/[id]/payments", () => {
  afterEach(async () => {
    await restoreOverdueInvoice();
  });

  it("records the outstanding balance and marks the invoice paid", async () => {
    await restoreOverdueInvoice();

    const response = await postPayment(paymentRequest({ method: "ach" }), params(overdueInvoiceId));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.payment).toMatchObject({
      invoiceId: overdueInvoiceId,
      amountCents: 9900,
      method: "ach",
      recordedBy: DEMO_OPERATOR.name,
    });
    expect(new Date(body.payment.recordedAt).toISOString()).toBe(DEMO_AS_OF.toISOString());

    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: overdueInvoiceId },
      include: { payments: true },
    });
    expect(invoice.status).toBe("PAID");
    expect(invoice.paidOn?.toISOString()).toBe(DEMO_AS_OF.toISOString());
    expect(invoice.payments).toHaveLength(1);

    const activity = await prisma.activity.findFirst({
      where: { invoiceId: overdueInvoiceId, type: ACTIVITY_TYPE_PAYMENT_RECORDED },
    });
    expect(activity).toMatchObject({
      customerId: "cus_silverpine",
      type: ACTIVITY_TYPE_PAYMENT_RECORDED,
      status: ACTIVITY_STATUS_RECORDED,
      actorName: DEMO_OPERATOR.name,
      amountCents: 9900,
      method: "ach",
    });
    expect(activity?.occurredOn.toISOString()).toBe(DEMO_AS_OF.toISOString());
  });

  it("returns 400 and does not change a zero-balance invoice", async () => {
    const before = await prisma.invoice.findUniqueOrThrow({ where: { id: paidInvoiceId } });

    const response = await postPayment(
      new Request("http://localhost/api/invoices/inv_1042/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "cash" }),
      }),
      params(paidInvoiceId),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Outstanding balance is 0" });

    const after = await prisma.invoice.findUniqueOrThrow({ where: { id: paidInvoiceId } });
    expect(after.status).toBe(before.status);
    expect(after.paidOn?.toISOString()).toBe(before.paidOn?.toISOString());
    expect(await prisma.payment.count({ where: { invoiceId: paidInvoiceId } })).toBe(0);
    expect(await prisma.activity.count({ where: { invoiceId: paidInvoiceId } })).toBe(0);
  });

  it("records when amountCents equals the outstanding balance", async () => {
    await restoreOverdueInvoice();

    const response = await postPayment(
      paymentRequest({ method: "check", amountCents: 9900 }),
      params(overdueInvoiceId),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.payment.amountCents).toBe(9900);
  });

  it("returns 400 and stores nothing when amountCents is not the outstanding balance", async () => {
    await restoreOverdueInvoice();

    const response = await postPayment(
      paymentRequest({ method: "check", amountCents: 1 }),
      params(overdueInvoiceId),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Amount must equal the outstanding balance",
    });

    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: overdueInvoiceId },
      include: { payments: true },
    });
    expect(invoice.status).toBe("OVERDUE");
    expect(invoice.paidOn).toBeNull();
    expect(invoice.payments).toHaveLength(0);
    expect(await prisma.activity.count({ where: { invoiceId: overdueInvoiceId } })).toBe(0);
  });
});

describe("recordPaymentConfirmCopy", () => {
  it("offers only the outstanding balance", () => {
    expect(recordPaymentConfirmCopy(9900, "INV-1047")).toBe(
      "Record $99.00 payment against INV-1047?",
    );
  });
});
