import { DEMO_AS_OF, DEMO_PRIOR_END, DEMO_PRIOR_START, DEMO_WINDOW_START } from "@/lib/clock";
import { sumCents } from "@/lib/money";
import { outstandingCents } from "@/lib/collections";
import { amountsVisible, isPlanId, planPriceCents } from "@/lib/plans";

type InvoiceLike = {
  status: string;
  issuedOn: Date;
  paidOn: Date | null;
  totalCents: number;
};

type DisputeLike = {
  status: string;
  openedOn: Date;
  disputedAmountCents: number;
};

export function isPaidInWindow(invoice: InvoiceLike, start: Date, end: Date) {
  return Boolean(
    invoice.status === "PAID" &&
      invoice.paidOn &&
      invoice.paidOn >= start &&
      invoice.paidOn <= end,
  );
}

export function isOpenAt(invoice: InvoiceLike, asOf: Date) {
  if (invoice.status === "VOID" || invoice.status === "DRAFT") return false;
  if (invoice.issuedOn > asOf) return false;
  if (invoice.paidOn && invoice.paidOn <= asOf) return false;
  return invoice.status === "OPEN" || invoice.status === "OVERDUE" || invoice.status === "PAID";
}

export function isActiveDisputeAt(dispute: DisputeLike, asOf: Date) {
  if (dispute.openedOn > asOf) return false;
  return dispute.status === "OPEN" || dispute.status === "NEEDS_REVIEW";
}

export function percentChange(current: number, prior: number): number | null {
  if (prior === 0) return current === 0 ? 0 : null;
  return ((current - prior) / prior) * 100;
}

export function catalogMrrCents(customers: { plan: string }[]) {
  return sumCents(
    customers.filter((customer) => isPlanId(customer.plan)).map((customer) => planPriceCents(customer.plan)),
  );
}

export function collectedCents(invoices: InvoiceLike[], start: Date, end: Date) {
  return sumCents(
    invoices.filter((invoice) => isPaidInWindow(invoice, start, end)).map((invoice) => invoice.totalCents),
  );
}

export function openCentsAt(invoices: InvoiceLike[], asOf: Date) {
  return sumCents(invoices.filter((invoice) => isOpenAt(invoice, asOf)).map((invoice) => invoice.totalCents));
}

export function disputeCentsAt(disputes: DisputeLike[], asOf: Date) {
  return sumCents(
    disputes.filter((dispute) => isActiveDisputeAt(dispute, asOf)).map((dispute) => dispute.disputedAmountCents),
  );
}

export function revenueSeries(invoices: InvoiceLike[], start: Date, end: Date) {
  const points: { date: string; cents: number }[] = [];
  const cursor = new Date(start);
  let running = 0;
  const paid = invoices
    .filter((invoice) => isPaidInWindow(invoice, start, end) && invoice.paidOn)
    .sort((a, b) => a.paidOn!.getTime() - b.paidOn!.getTime());
  let index = 0;

  while (cursor <= end) {
    while (index < paid.length && paid[index].paidOn! <= cursor) {
      running += paid[index].totalCents;
      index += 1;
    }
    points.push({ date: cursor.toISOString().slice(0, 10), cents: running });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return points;
}

export function disputeBreakdown(disputes: DisputeLike[]) {
  const needsResponse = disputes.filter((dispute) => dispute.status === "NEEDS_REVIEW").length;
  const inReview = disputes.filter((dispute) => dispute.status === "OPEN").length;
  const resolved = disputes.filter(
    (dispute) => dispute.status === "ACCEPTED" || dispute.status === "DECLINED",
  ).length;
  return [
    { id: "needs", label: "Needs response", count: needsResponse, color: "#dc2626" },
    { id: "review", label: "In review", count: inReview, color: "#d97706" },
    { id: "resolved", label: "Resolved", color: "#4f46e5", count: resolved },
  ] as const;
}

export const DASHBOARD_WINDOWS = {
  currentStart: DEMO_WINDOW_START,
  currentEnd: DEMO_AS_OF,
  priorStart: DEMO_PRIOR_START,
  priorEnd: DEMO_PRIOR_END,
};

function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function collectionsKpi(input: {
  invoices: {
    status: string;
    totalCents: number;
    customer: { plan: string };
    payments?: { amountCents: number }[];
  }[];
  activities: { occurredOn: Date }[];
  asOf?: Date;
}) {
  const asOf = input.asOf ?? DEMO_AS_OF;
  const overdue = input.invoices.filter((invoice) => invoice.status === "OVERDUE");
  const weekStart = new Date(asOf);
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);
  const today = utcDay(asOf);
  const weekStartDay = utcDay(weekStart);

  return {
    overdueCount: overdue.length,
    overdueCents: sumCents(
      overdue.filter((invoice) => isPlanId(invoice.customer.plan)).map((invoice) => outstandingCents(invoice)),
    ),
    amountsVisible: overdue.every((invoice) => amountsVisible(invoice.customer.plan)),
    activitiesToday: input.activities.filter((activity) => utcDay(activity.occurredOn) === today).length,
    activitiesThisWeek: input.activities.filter((activity) => {
      const day = utcDay(activity.occurredOn);
      return day >= weekStartDay && day <= today;
    }).length,
  };
}
