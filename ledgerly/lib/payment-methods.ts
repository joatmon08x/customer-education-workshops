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

export function paymentMethodLabel(method: string): string {
  return isPaymentMethod(method) ? METHOD_LABELS[method] : method;
}
