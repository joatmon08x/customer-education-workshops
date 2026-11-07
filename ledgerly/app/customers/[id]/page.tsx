import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionNoteForm } from "@/app/customers/[id]/collection-note-form";
import { SendNudgeButton } from "@/app/customers/[id]/send-nudge-button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEMO_AS_OF } from "@/lib/clock";
import { getCustomer } from "@/lib/data";
import { daysBetween, formatDate } from "@/lib/dates";
import { formatUsd } from "@/lib/money";
import { ACTIVITY_STATUS_FAILED } from "@/lib/nudge";
import { outstandingBalanceCents, paymentMethodLabel } from "@/lib/payments";
import { isPlanId, planLabel } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(id);
  return { title: customer ? customer.name : "Customer" };
}

export default async function CustomerAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();
  if (!isPlanId(customer.plan)) notFound();

  const latestActivity = customer.activities[0] ?? null;
  const lastActivityLabel = latestActivity
    ? `${latestActivity.type} · ${formatDate(latestActivity.occurredOn)}`
    : "—";

  const overdueBook = customer.invoices
    .filter((invoice) => invoice.status === "OVERDUE")
    .map((invoice) => ({
      ...invoice,
      daysPastDue: Math.max(0, daysBetween(DEMO_AS_OF, invoice.dueOn)),
      outstandingCents: outstandingBalanceCents(invoice),
    }))
    .sort((a, b) => b.daysPastDue - a.daysPastDue || a.number.localeCompare(b.number));

  const mostPastDueInvoiceId = overdueBook[0]?.id;
  const hasOverdue = overdueBook.length > 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Account"
        title={customer.name}
        description={`${planLabel(customer.plan)} · ${customer.contactName} · ${customer.email}`}
        actions={
          <SendNudgeButton
            invoiceId={mostPastDueInvoiceId}
            disabled={!hasOverdue}
            aria-label="Nudge most past due invoice"
          />
        }
      />

      <Card className="overflow-hidden py-0">
        <CardHeader className="px-5 pt-5">
          <CardTitle>Overdue Book</CardTitle>
          <CardDescription>
            Overdue invoices for this account only, days past due descending. Outstanding balance is
            the invoice total minus recorded payments. Last activity shows an em dash when the
            account has no activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-4">
          {overdueBook.length === 0 ? (
            <p className="px-5 pb-1 text-sm text-muted-foreground">No overdue invoices on this account.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Invoice date</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead className="text-right">Days past due</TableHead>
                  <TableHead className="text-right">Outstanding balance</TableHead>
                  <TableHead>Last activity</TableHead>
                  <TableHead className="text-right">Nudge</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueBook.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="font-mono text-[13px] font-medium hover:underline"
                      >
                        {invoice.number}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(invoice.issuedOn)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(invoice.dueOn)}</TableCell>
                    <TableCell className="text-right tabular-nums">{invoice.daysPastDue}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatUsd(invoice.outstandingCents)}
                    </TableCell>
                    <TableCell
                      className="text-muted-foreground"
                      aria-label={latestActivity ? lastActivityLabel : "No activity"}
                    >
                      {lastActivityLabel}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <SendNudgeButton
                          invoiceId={invoice.id}
                          size="sm"
                          aria-label={`Nudge ${invoice.number}`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Collection note</CardTitle>
          <CardDescription>Saved notes land first on this account’s activity feed.</CardDescription>
        </CardHeader>
        <CardContent>
          <CollectionNoteForm
            customerId={customer.id}
            invoices={customer.invoices.map((invoice) => ({
              id: invoice.id,
              number: invoice.number,
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Collections history for this account. Newest first.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {customer.activities.length === 0 ? (
            <p className="text-muted-foreground">—</p>
          ) : (
            <ul className="space-y-3">
              {customer.activities.map((activity) => (
                <li key={activity.id} className="flex flex-col gap-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium">{activity.type}</span>
                    <span className="text-muted-foreground">{formatDate(activity.occurredOn)}</span>
                  </div>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
                    <span>
                      {[
                        activity.amountCents != null ? formatUsd(activity.amountCents) : null,
                        activity.method ? paymentMethodLabel(activity.method) : activity.channel,
                        activity.actorName,
                        activity.invoice?.number,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    {activity.status === ACTIVITY_STATUS_FAILED ? (
                      <Badge variant="danger">{ACTIVITY_STATUS_FAILED}</Badge>
                    ) : (
                      <span>{activity.status}</span>
                    )}
                  </p>
                  {activity.body ? <p>{activity.body}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
