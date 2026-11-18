import { DEMO_AS_OF } from "@/lib/clock";
import { outstandingCents } from "@/lib/collections";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { isPaymentMethod, PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment-methods";
import { prisma } from "@/lib/prisma";

const PAYABLE_STATUSES = new Set(["OPEN", "OVERDUE"]);

export type RecordPaymentResult =
  | { ok: true; payment: { id: string; amountCents: number; method: PaymentMethod } }
  | { ok: false; status: 400 | 404; error: string };

/**
 * Records the full outstanding balance. A supplied amountCents is only a
 * check: anything other than the outstanding balance is rejected, never stored.
 */
export async function recordFullPayment(
  invoiceId: string,
  input: { method: unknown; amountCents?: unknown },
): Promise<RecordPaymentResult> {
  if (!isPaymentMethod(input.method)) {
    return { ok: false, status: 400, error: `Method must be one of ${PAYMENT_METHODS.join(", ")}` };
  }
  const method = input.method;

  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: { select: { amountCents: true } } },
    });
    if (!invoice) return { ok: false, status: 404, error: "Invoice not found" } as const;

    const amountCents = outstandingCents(invoice);
    if (!PAYABLE_STATUSES.has(invoice.status) || amountCents <= 0) {
      return { ok: false, status: 400, error: "Invoice has no outstanding balance" } as const;
    }
    if (input.amountCents !== undefined && input.amountCents !== amountCents) {
      return { ok: false, status: 400, error: "Payment must be the full outstanding balance" } as const;
    }

    const payment = await tx.payment.create({
      data: {
        invoiceId,
        amountCents,
        method,
        recordedBy: DEMO_OPERATOR.name,
        recordedAt: DEMO_AS_OF,
      },
    });
    await tx.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID", paidOn: DEMO_AS_OF },
    });
    await tx.activity.create({
      data: {
        customerId: invoice.customerId,
        invoiceId,
        type: "PAYMENT_RECORDED",
        status: "recorded",
        actorName: DEMO_OPERATOR.name,
        payload: JSON.stringify({ paymentId: payment.id, amountCents, method }),
        occurredOn: DEMO_AS_OF,
      },
    });

    return { ok: true, payment: { id: payment.id, amountCents, method } } as const;
  });
}

/** Amount and method from a PAYMENT_RECORDED payload, or null when it is missing or malformed. */
export function paymentFromPayload(payload: string | null): { amountCents: number; method: string } | null {
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload) as { amountCents?: unknown; method?: unknown };
    if (typeof parsed.amountCents !== "number" || typeof parsed.method !== "string") return null;
    return { amountCents: parsed.amountCents, method: parsed.method };
  } catch {
    return null;
  }
}
