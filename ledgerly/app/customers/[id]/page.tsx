import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { InvoiceStatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAccountActivities, lastActivityByInvoice } from "@/lib/activity";
import { DEMO_AS_OF } from "@/lib/clock";
import { overdueBook } from "@/lib/collections";
import { getCustomer } from "@/lib/data";
import { formatDate } from "@/lib/dates";
import { formatUsd } from "@/lib/money";
import { paymentMethodLabel } from "@/lib/payment-methods";
import { paymentFromPayload } from "@/lib/payments";
import { planLabel } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(id);
  return { title: customer ? customer.name : "Customer" };
}

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  const activities = await getAccountActivities(customer.id);
  const book = overdueBook(customer.invoices, DEMO_AS_OF);
  const lastActivity = lastActivityByInvoice(activities);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Account"
        title={customer.name}
        description={`${planLabel(customer.plan)} · ${customer.contactName} · ${customer.email}`}
      />

      <Card className="overflow-hidden py-0">
        <CardHeader className="px-5 pt-5">
          <CardTitle>Overdue Book</CardTitle>
          <CardDescription>
            OVERDUE invoices for this account, most days past due first. Aged against 23 Aug 2026.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          {book.length === 0 ? (
            <p className="px-5 pb-4 text-sm text-muted-foreground">No overdue invoices on this account.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Invoice date</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead className="text-right">Days past due</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead>Last activity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {book.map((invoice) => {
                  const last = lastActivity.get(invoice.id);
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="inline-flex items-center gap-2 hover:underline"
                        >
                          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-soft text-indigo">
                            <FileText className="size-3.5" />
                          </span>
                          <span className="font-mono text-[13px] font-medium">{invoice.number}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(invoice.issuedOn)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(invoice.dueOn)}</TableCell>
                      <TableCell className="text-right">{invoice.daysPastDue}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatUsd(invoice.outstandingCents)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{last ? formatDate(last) : "—"}</TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={invoice.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Notes, Nudges, and payments on this account, newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity on this account yet.</p>
          ) : (
            <ol className="space-y-3" aria-label="Account activity">
              {activities.map((activity) => {
                const payment = activity.type === "PAYMENT_RECORDED" ? paymentFromPayload(activity.payload) : null;
                return (
                  <li key={activity.id} className="text-sm">
                    <p className="font-medium">
                      {activity.type} · {activity.status}
                      {activity.invoice ? ` · ${activity.invoice.number}` : ""}
                    </p>
                    {payment ? (
                      <p>
                        {formatUsd(payment.amountCents)} · {paymentMethodLabel(payment.method)}
                      </p>
                    ) : null}
                    <p className="text-muted-foreground">
                      {activity.actorName} · {formatDate(activity.occurredOn)}
                    </p>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
