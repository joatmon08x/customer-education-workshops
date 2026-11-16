import { DEMO_AS_OF } from "@/lib/clock";
import { daysBetween, formatDate } from "@/lib/dates";
import { sumCents } from "@/lib/money";

export const PAYMENT_METHODS = ["check", "ach", "card_on_file", "cash"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  check: "Check",
  ach: "ACH",
  card_on_file: "Card on file",
  cash: "Cash",
};

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === "string" && (PAYMENT_METHODS as readonly string[]).includes(value);
}

export const ACTIVITY_TYPES = ["NOTE_ADDED", "NUDGE_SENT", "PAYMENT_RECORDED"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const NOTE_EDIT_WINDOW_MS = 15 * 60 * 1000;

export function outstandingCents(invoice: {
  totalCents: number;
  payments: { amountCents: number }[];
}): number {
  return Math.max(0, invoice.totalCents - sumCents(invoice.payments.map((payment) => payment.amountCents)));
}

export function daysPastDue(invoice: { dueOn: Date }, asOf: Date = DEMO_AS_OF): number {
  return daysBetween(asOf, invoice.dueOn);
}

/** OVERDUE invoices only, most days past due first. */
export function overdueBook<T extends { status: string; dueOn: Date }>(invoices: T[]): T[] {
  return invoices
    .filter((invoice) => invoice.status === "OVERDUE")
    .sort((a, b) => daysPastDue(b) - daysPastDue(a));
}

export function isEmailAddress(value: string | null | undefined): boolean {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** The fixed v1 reminder. No custom composition. */
export function nudgeTemplate(input: { invoiceNumber: string; balance: string; dueOn: Date }): string {
  return `Reminder: ${input.invoiceNumber} has ${input.balance} outstanding, due ${formatDate(input.dueOn)}. Please arrange payment or reply to this email.`;
}

export function canEditNote(
  note: { authorName: string; createdAt: Date },
  editorName: string,
  now: Date = new Date(),
): boolean {
  if (note.authorName !== editorName) return false;
  return now.getTime() - note.createdAt.getTime() < NOTE_EDIT_WINDOW_MS;
}
