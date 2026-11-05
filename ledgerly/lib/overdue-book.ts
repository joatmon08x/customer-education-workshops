import { DEMO_AS_OF } from "@/lib/clock";
import { daysBetween } from "@/lib/dates";
import { sumCents } from "@/lib/money";
import { outstandingBalanceCents } from "@/lib/payments";

export const NO_ACTIVITY = "—";

export type OverdueBookInvoice = {
  customerId: string;
  id: string;
  number: string;
  status: string;
  issuedOn: Date;
  dueOn: Date;
  totalCents: number;
  payments?: { amountCents: number }[];
};

export type OverdueBookRow = {
  id: string;
  number: string;
  issuedOn: Date;
  dueOn: Date;
  daysPastDue: number;
  outstandingCents: number;
  lastActivity: typeof NO_ACTIVITY;
};

export function lastActivityLabel(): typeof NO_ACTIVITY {
  return NO_ACTIVITY;
}

export function overdueBookForAccount(
  invoices: OverdueBookInvoice[],
  customerId: string,
  asOf: Date = DEMO_AS_OF,
): OverdueBookRow[] {
  return invoices
    .filter((invoice) => invoice.customerId === customerId && invoice.status === "OVERDUE")
    .map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      issuedOn: invoice.issuedOn,
      dueOn: invoice.dueOn,
      daysPastDue: Math.max(0, daysBetween(asOf, invoice.dueOn)),
      outstandingCents: outstandingBalanceCents(invoice),
      lastActivity: lastActivityLabel(),
    }))
    .sort((left, right) => right.daysPastDue - left.daysPastDue);
}

export function overdueBalanceCents(rows: Pick<OverdueBookRow, "outstandingCents">[]): number {
  return sumCents(rows.map((row) => row.outstandingCents));
}
