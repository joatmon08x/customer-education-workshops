export const PAYMENT_METHODS = ["check", "ach", "card_on_file", "cash"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

const METHOD_LABELS: Record<PaymentMethod, string> = {
  check: "Check",
  ach: "ACH",
  card_on_file: "Card on file",
  cash: "Cash",
};

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === "string" && (PAYMENT_METHODS as readonly string[]).includes(value);
}

export function paymentMethodLabel(method: PaymentMethod): string {
  return METHOD_LABELS[method];
}

export function outstandingCents(
  totalCents: number,
  payments: ReadonlyArray<{ amountCents: number }>,
): number {
  const paid = payments.reduce((sum, payment) => sum + payment.amountCents, 0);
  return Math.max(0, totalCents - paid);
}
