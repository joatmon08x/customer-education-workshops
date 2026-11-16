import { afterEach, describe, expect, it } from "vitest";
import { POST as recordPayment } from "@/app/api/invoices/[id]/payments/route";
import { DEMO_AS_OF } from "@/lib/clock";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

const OVERDUE_ID = "inv_1043";
const params = (id: string) => ({ params: Promise.resolve({ id }) });

async function restoreOverdueInvoice() {
  await prisma.payment.deleteMany({ where: { invoiceId: OVERDUE_ID } });
  await prisma.activity.deleteMany({ where: { invoiceId: OVERDUE_ID } });
  await prisma.invoice.update({
    where: { id: OVERDUE_ID },
    data: { status: "OVERDUE", paidOn: null },
  });
}

afterEach(async () => {
  await restoreOverdueInvoice();
});

describe("POST /api/invoices/[id]/payments", () => {
  it("records the full outstanding balance and marks the invoice PAID", async () => {
    await restoreOverdueInvoice();
    const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: OVERDUE_ID } });

    const response = await recordPayment(
      new Request(`http://localhost/api/invoices/${OVERDUE_ID}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "ach" }),
      }),
      params(OVERDUE_ID),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.payment).toMatchObject({
      invoiceId: OVERDUE_ID,
      amountCents: invoice.totalCents,
      method: "ach",
      recordedBy: DEMO_OPERATOR.name,
    });
    expect(new Date(body.payment.recordedAt).getTime()).toBe(DEMO_AS_OF.getTime());
    expect(body.activity).toMatchObject({
      customerId: invoice.customerId,
      invoiceId: OVERDUE_ID,
      type: "PAYMENT_RECORDED",
      status: "recorded",
      amountCents: invoice.totalCents,
      method: "ach",
      actorName: DEMO_OPERATOR.name,
    });
    expect(new Date(body.activity.occurredOn).getTime()).toBe(DEMO_AS_OF.getTime());
    expect(body.invoice).toMatchObject({
      id: OVERDUE_ID,
      status: "PAID",
    });
    expect(new Date(body.invoice.paidOn).getTime()).toBe(DEMO_AS_OF.getTime());

    const stored = await prisma.invoice.findUniqueOrThrow({
      where: { id: OVERDUE_ID },
      include: { payments: true, activities: true },
    });
    expect(stored.status).toBe("PAID");
    expect(stored.payments).toHaveLength(1);
    expect(stored.activities).toHaveLength(1);
  });

  it("returns 400 when outstanding balance is 0 and leaves status unchanged", async () => {
    await restoreOverdueInvoice();
    const before = await prisma.invoice.findUniqueOrThrow({ where: { id: OVERDUE_ID } });
    await prisma.payment.create({
      data: {
        id: "pay_test_zero_balance",
        invoiceId: OVERDUE_ID,
        amountCents: before.totalCents,
        method: "cash",
        recordedBy: DEMO_OPERATOR.name,
        recordedAt: DEMO_AS_OF,
      },
    });

    const response = await recordPayment(
      new Request(`http://localhost/api/invoices/${OVERDUE_ID}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "check" }),
      }),
      params(OVERDUE_ID),
    );

    expect(response.status).toBe(400);
    const after = await prisma.invoice.findUniqueOrThrow({
      where: { id: OVERDUE_ID },
      include: { payments: true, activities: true },
    });
    expect(after.status).toBe("OVERDUE");
    expect(after.paidOn).toBeNull();
    expect(after.payments).toHaveLength(1);
    expect(after.activities).toHaveLength(0);
  });

  it("returns 400 when amountCents is not the outstanding balance", async () => {
    await restoreOverdueInvoice();
    const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: OVERDUE_ID } });

    const response = await recordPayment(
      new Request(`http://localhost/api/invoices/${OVERDUE_ID}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "check", amountCents: invoice.totalCents - 100 }),
      }),
      params(OVERDUE_ID),
    );

    expect(response.status).toBe(400);
    const after = await prisma.invoice.findUniqueOrThrow({
      where: { id: OVERDUE_ID },
      include: { payments: true, activities: true },
    });
    expect(after.status).toBe("OVERDUE");
    expect(after.paidOn).toBeNull();
    expect(after.payments).toHaveLength(0);
    expect(after.activities).toHaveLength(0);
  });

  it("accepts amountCents that matches the outstanding balance", async () => {
    await restoreOverdueInvoice();
    const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: OVERDUE_ID } });

    const response = await recordPayment(
      new Request(`http://localhost/api/invoices/${OVERDUE_ID}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "card_on_file", amountCents: invoice.totalCents }),
      }),
      params(OVERDUE_ID),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.payment.amountCents).toBe(invoice.totalCents);
    expect(body.invoice.status).toBe("PAID");
  });
});
