import { DEMO_AS_OF } from "@/lib/clock";
import { daysBetween, formatDate } from "@/lib/dates";
import { formatUsd, sumCents } from "@/lib/money";
import { AMOUNTS_MASKED_COPY, amountsVisible, isPlanId, planLabel } from "@/lib/plans";

export const PAYMENT_METHODS = ["check", "ach", "card_on_file", "cash"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  check: "Check",
  ach: "ACH",
  card_on_file: "Card on file",
  cash: "Cash",
};

export const NOTE_EDIT_WINDOW_MS = 15 * 60 * 1000;

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === "string" && (PAYMENT_METHODS as readonly string[]).includes(value);
}

export function paymentMethodLabel(method: string): string {
  return isPaymentMethod(method) ? PAYMENT_METHOD_LABEL[method] : method;
}

export function outstandingCents(invoice: {
  totalCents: number;
  payments?: { amountCents: number }[];
}): number {
  const paid = sumCents((invoice.payments ?? []).map((payment) => payment.amountCents));
  return Math.max(0, invoice.totalCents - paid);
}

export function daysPastDue(invoice: { status: string; dueOn: Date }, asOf: Date = DEMO_AS_OF): number {
  if (invoice.status !== "OVERDUE") return 0;
  return Math.max(0, daysBetween(asOf, invoice.dueOn));
}

/** OVERDUE invoices only, most days past due first. */
export function overdueBook<T extends { status: string; dueOn: Date }>(invoices: T[]): T[] {
  return invoices
    .filter((invoice) => invoice.status === "OVERDUE")
    .sort((a, b) => daysPastDue(b) - daysPastDue(a));
}

/** Formats a dollar figure for an account, or the upgrade copy off the catalog. */
export function accountUsd(cents: number, plan: string): string {
  return amountsVisible(plan) ? formatUsd(cents) : AMOUNTS_MASKED_COPY;
}

export function safePlanLabel(plan: string): string {
  return isPlanId(plan) ? planLabel(plan) : plan;
}

export function isEmailAddress(value: string | null | undefined): boolean {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Fixed v1 reminder. No custom composition. */
export function nudgeMessage(invoice: { number: string; dueOn: Date; outstandingCents: number }): string {
  return `Reminder: invoice ${invoice.number} has ${formatUsd(invoice.outstandingCents)} outstanding. It was due ${formatDate(invoice.dueOn)}. Reply to this email if you have already paid.`;
}

export function canEditNote(
  note: { authorName: string; createdAt: Date },
  editorName: string,
  now: Date = new Date(),
): boolean {
  if (note.authorName !== editorName) return false;
  const age = now.getTime() - note.createdAt.getTime();
  return age >= 0 && age < NOTE_EDIT_WINDOW_MS;
}
