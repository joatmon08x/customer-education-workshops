import { overdueBook } from "@/lib/collections";
import { formatDate } from "@/lib/dates";
import { formatUsd } from "@/lib/money";

export const NUDGE_CHANNEL = "email";

/** The account Nudge goes to the most-past-due OVERDUE invoice, or nothing. */
export function accountNudgeTarget<T extends Parameters<typeof overdueBook>[0][number]>(invoices: T[], asOf: Date) {
  return overdueBook(invoices, asOf)[0] ?? null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmailAddress(value: string | null | undefined): value is string {
  return typeof value === "string" && EMAIL_PATTERN.test(value.trim());
}

/** The fixed v1 reminder. No custom copy. */
export function nudgeTemplate(invoice: { number: string; outstandingCents: number; dueOn: Date }) {
  return {
    subject: `Reminder: invoice ${invoice.number} is past due`,
    body: `Invoice ${invoice.number} has an outstanding balance of ${formatUsd(invoice.outstandingCents)}, due ${formatDate(invoice.dueOn)}. Reply to this email to arrange payment.`,
  };
}

export type NudgePayload = {
  to: string | null;
  subject: string;
  body: string;
  error?: string;
};

export function parseNudgePayload(payload: string | null): NudgePayload | null {
  if (!payload) return null;
  try {
    return JSON.parse(payload) as NudgePayload;
  } catch {
    return null;
  }
}
