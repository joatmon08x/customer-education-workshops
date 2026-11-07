import { DEMO_AS_OF } from "@/lib/clock";
import { formatDate } from "@/lib/dates";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { formatUsd } from "@/lib/money";
import { outstandingBalanceCents } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export const ACTIVITY_TYPE_NUDGE_SENT = "NUDGE_SENT";
export const ACTIVITY_STATUS_SENT = "sent";
export const ACTIVITY_STATUS_FAILED = "failed";
export const NUDGE_CHANNEL_EMAIL = "email";

export function isNudgeEmailAddress(email: string | null | undefined): boolean {
  if (!email) return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function nudgeTemplate(invoice: {
  number: string;
  dueOn: Date;
  outstandingCents: number;
}): string {
  return `Invoice ${invoice.number} is outstanding for ${formatUsd(invoice.outstandingCents)}. It was due ${formatDate(invoice.dueOn)}. Please remit payment.`;
}

export async function sendInvoiceNudge(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { customer: true, payments: true },
  });
  if (!invoice) {
    return { ok: false as const, status: 404 as const, error: "Invoice not found" };
  }
  if (invoice.status !== "OVERDUE") {
    return { ok: false as const, status: 400 as const, error: "Invoice is not overdue" };
  }

  const outstandingCents = outstandingBalanceCents(invoice);
  const body = nudgeTemplate({
    number: invoice.number,
    dueOn: invoice.dueOn,
    outstandingCents,
  });
  const activityId = `act_${crypto.randomUUID()}`;
  const status = isNudgeEmailAddress(invoice.customer.email)
    ? ACTIVITY_STATUS_SENT
    : ACTIVITY_STATUS_FAILED;

  const activity = await prisma.activity.create({
    data: {
      id: activityId,
      customerId: invoice.customerId,
      invoiceId: invoice.id,
      type: ACTIVITY_TYPE_NUDGE_SENT,
      status,
      occurredOn: DEMO_AS_OF,
      actorName: DEMO_OPERATOR.name,
      amountCents: outstandingCents,
      channel: NUDGE_CHANNEL_EMAIL,
      body,
    },
  });

  return { ok: true as const, activity };
}
