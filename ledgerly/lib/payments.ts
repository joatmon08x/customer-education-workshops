import { DEMO_AS_OF } from "@/lib/clock";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { formatUsd, sumCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const PAYMENT_METHODS = ["check", "ach", "card_on_file", "cash"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  check: "Check",
  ach: "ACH",
  card_on_file: "Card on file",
  cash: "Cash",
};

export const ACTIVITY_TYPE_PAYMENT_RECORDED = "PAYMENT_RECORDED";
export const ACTIVITY_STATUS_RECORDED = "recorded";

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === "string" && (PAYMENT_METHODS as readonly string[]).includes(value);
}

export function outstandingBalanceCents(invoice: {
  status: string;
  totalCents: number;
  payments?: { amountCents: number }[];
}): number {
  const recorded = sumCents((invoice.payments ?? []).map((payment) => payment.amountCents));
  if (recorded > 0) {
    return Math.max(0, invoice.totalCents - recorded);
  }
  if (invoice.status === "PAID" || invoice.status === "VOID") {
    return 0;
  }
  return invoice.totalCents;
}

export function paymentMethodLabel(method: string): string {
  if (isPaymentMethod(method)) {
    return PAYMENT_METHOD_LABEL[method];
  }
  return method;
}

export function recordPaymentConfirmCopy(amountCents: number, invoiceNumber: string): string {
  return `Record ${formatUsd(amountCents)} payment against ${invoiceNumber}?`;
}

export function readPostedAmountCents(
  body: unknown,
): { ok: true; amountCents?: number } | { ok: false; error: string } {
  if (!body || typeof body !== "object" || !("amountCents" in body)) {
    return { ok: true };
  }
  const value = (body as { amountCents: unknown }).amountCents;
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return { ok: false, error: "amountCents must be an integer" };
  }
  return { ok: true, amountCents: value };
}

export async function recordFullPayment(
  invoiceId: string,
  method: PaymentMethod,
  postedAmountCents?: number,
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });
  if (!invoice) {
    return { ok: false as const, status: 404 as const, error: "Invoice not found" };
  }

  const amountCents = outstandingBalanceCents(invoice);
  if (amountCents <= 0) {
    return { ok: false as const, status: 400 as const, error: "Outstanding balance is 0" };
  }
  if (postedAmountCents !== undefined && postedAmountCents !== amountCents) {
    return {
      ok: false as const,
      status: 400 as const,
      error: "Amount must equal the outstanding balance",
    };
  }

  const paymentId = `pay_${crypto.randomUUID()}`;
  const activityId = `act_${crypto.randomUUID()}`;

  const payment = await prisma.$transaction(async (tx) => {
    const created = await tx.payment.create({
      data: {
        id: paymentId,
        invoiceId: invoice.id,
        amountCents,
        method,
        recordedBy: DEMO_OPERATOR.name,
        recordedAt: DEMO_AS_OF,
      },
    });
    await tx.activity.create({
      data: {
        id: activityId,
        customerId: invoice.customerId,
        invoiceId: invoice.id,
        type: ACTIVITY_TYPE_PAYMENT_RECORDED,
        status: ACTIVITY_STATUS_RECORDED,
        occurredOn: DEMO_AS_OF,
        actorName: DEMO_OPERATOR.name,
        amountCents,
        method,
      },
    });
    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        status: "PAID",
        paidOn: DEMO_AS_OF,
      },
    });
    return created;
  });

  return { ok: true as const, payment, amountCents };
}
