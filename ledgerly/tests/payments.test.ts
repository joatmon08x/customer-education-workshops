import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST as recordPayment } from "@/app/api/invoices/[id]/payments/route";
import { getAccountActivities } from "@/lib/activity";
import { DEMO_AS_OF } from "@/lib/clock";
import { outstandingCents, overdueBook } from "@/lib/collections";
import { getCustomer } from "@/lib/data";
import { PLAN_PRICE_CENTS } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

// Alder BioSystems, Scale, OVERDUE on the demo clock.
const INVOICE_ID = "inv_2003";
const CUSTOMER_ID = "cus_alderbio";

const post = (body: unknown) =>
  recordPayment(
    new Request(`http://localhost/api/invoices/${INVOICE_ID}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: INVOICE_ID }) },
  );

let original: { status: string; paidOn: Date | null };

async function cleanup() {
  await prisma.activity.deleteMany({ where: { invoiceId: INVOICE_ID, type: "PAYMENT_RECORDED" } });
  await prisma.payment.deleteMany({ where: { invoiceId: INVOICE_ID } });
}

beforeEach(async () => {
  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: INVOICE_ID } });
  expect(invoice.customerId).toBe(CUSTOMER_ID);
  expect(invoice.status).toBe("OVERDUE");
  original = { status: invoice.status, paidOn: invoice.paidOn };
  await cleanup();
});

afterEach(async () => {
  await cleanup();
  await prisma.invoice.update({ where: { id: INVOICE_ID }, data: original });
});

describe("outstandingCents", () => {
  it("subtracts recorded payments and never goes below zero", () => {
    const totalCents = PLAN_PRICE_CENTS.SCALE;
    expect(outstandingCents({ totalCents })).toBe(24900);
    expect(outstandingCents({ totalCents, payments: [{ amountCents: 4900 }] })).toBe(20000);
    expect(outstandingCents({ totalCents, payments: [{ amountCents: 24900 }, { amountCents: 100 }] })).toBe(0);
  });
});

describe("POST /api/invoices/[id]/payments", () => {
  it("records the full outstanding balance, marks the invoice PAID, and logs PAYMENT_RECORDED", async () => {
    const response = await post({ method: "ach" });
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      payment: { amountCents: PLAN_PRICE_CENTS.SCALE, method: "ach" },
    });

    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: INVOICE_ID },
      include: { payments: true },
    });
    expect(invoice.status).toBe("PAID");
    expect(invoice.paidOn).toEqual(DEMO_AS_OF);
    expect(invoice.payments).toHaveLength(1);
    expect(invoice.payments[0]).toMatchObject({
      amountCents: PLAN_PRICE_CENTS.SCALE,
      method: "ach",
      recordedBy: "Avery Quinn",
      recordedAt: DEMO_AS_OF,
    });

    const customer = await getCustomer(CUSTOMER_ID);
    expect(overdueBook(customer!.invoices, DEMO_AS_OF).map((row) => row.id)).not.toContain(INVOICE_ID);

    const [activity] = (await getAccountActivities(CUSTOMER_ID)).filter((row) => row.type === "PAYMENT_RECORDED");
    expect(activity).toMatchObject({
      invoiceId: INVOICE_ID,
      status: "recorded",
      actorName: "Avery Quinn",
      occurredOn: DEMO_AS_OF,
    });
    expect(JSON.parse(activity.payload!)).toMatchObject({ amountCents: PLAN_PRICE_CENTS.SCALE, method: "ach" });
  });

  it("returns 400 and leaves the status alone when the outstanding balance is 0", async () => {
    expect((await post({ method: "cash" })).status).toBe(201);

    const response = await post({ method: "cash" });
    expect(response.status).toBe(400);

    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: INVOICE_ID },
      include: { payments: true },
    });
    expect(invoice.status).toBe("PAID");
    expect(invoice.payments).toHaveLength(1);
  });

  it.each([100, PLAN_PRICE_CENTS.SCALE - 1, PLAN_PRICE_CENTS.SCALE + 1, "24900"])(
    "rejects amountCents %s that is not the outstanding balance and stores nothing",
    async (amountCents) => {
      const response = await post({ method: "check", amountCents });
      expect(response.status).toBe(400);

      const invoice = await prisma.invoice.findUniqueOrThrow({
        where: { id: INVOICE_ID },
        include: { payments: true, activities: { where: { type: "PAYMENT_RECORDED" } } },
      });
      expect(invoice.status).toBe("OVERDUE");
      expect(invoice.paidOn).toBeNull();
      expect(invoice.payments).toHaveLength(0);
      expect(invoice.activities).toHaveLength(0);
    },
  );

  it("rejects a method outside check, ach, card_on_file, and cash", async () => {
    const response = await post({ method: "wire" });
    expect(response.status).toBe(400);
    const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: INVOICE_ID } });
    expect(invoice.status).toBe("OVERDUE");
  });
});
