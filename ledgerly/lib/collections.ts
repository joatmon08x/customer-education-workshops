import { daysBetween } from "@/lib/dates";

type BookInvoice = {
  id: string;
  status: string;
  dueOn: Date;
  totalCents: number;
  payments?: { amountCents: number }[];
};

/** totalCents minus recorded payments, never below zero. */
export function outstandingCents(invoice: Pick<BookInvoice, "totalCents" | "payments">): number {
  const paid = (invoice.payments ?? []).reduce((total, payment) => total + payment.amountCents, 0);
  return Math.max(0, invoice.totalCents - paid);
}

/** OVERDUE invoices only, most days past due first. Age against the demo clock. */
export function overdueBook<T extends BookInvoice>(invoices: T[], asOf: Date) {
  return invoices
    .filter((invoice) => invoice.status === "OVERDUE")
    .map((invoice) => ({
      ...invoice,
      daysPastDue: Math.max(0, daysBetween(asOf, invoice.dueOn)),
      outstandingCents: outstandingCents(invoice),
    }))
    .sort((a, b) => b.daysPastDue - a.daysPastDue);
}
