import { prisma } from "@/lib/prisma";

export const ACTIVITY_TYPES = ["NOTE_ADDED", "NUDGE_SENT", "PAYMENT_RECORDED"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_STATUSES = ["recorded", "sent", "failed"] as const;
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

/** The account activity feed, newest first. */
export async function getAccountActivities(customerId: string) {
  return prisma.activity.findMany({
    where: { customerId },
    include: { invoice: { select: { id: true, number: true } } },
    orderBy: [{ occurredOn: "desc" }, { createdAt: "desc" }],
  });
}

/** Latest occurredOn per invoice id, for the Overdue Book's last activity column. */
export function lastActivityByInvoice(activities: { invoiceId: string | null; occurredOn: Date }[]) {
  const latest = new Map<string, Date>();
  for (const activity of activities) {
    if (!activity.invoiceId) continue;
    const current = latest.get(activity.invoiceId);
    if (!current || activity.occurredOn > current) latest.set(activity.invoiceId, activity.occurredOn);
  }
  return latest;
}
