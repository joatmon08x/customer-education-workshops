import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityFeed, type ActivityItem } from "@/components/collections/activity-feed";
import { NoteForm } from "@/components/collections/note-form";
import { NudgeButton } from "@/components/collections/nudge-button";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  accountUsd,
  daysPastDue,
  outstandingCents,
  overdueBook,
  paymentMethodLabel,
  safePlanLabel,
} from "@/lib/collections";
import { getCustomer } from "@/lib/data";
import { formatDate } from "@/lib/dates";
import { DEMO_OPERATOR } from "@/lib/demo-session";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(id);
  return { title: customer ? customer.name : "Customer" };
}

function formatTimestamp(occurredOn: Date, createdAt: Date) {
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(createdAt);
  return `${formatDate(occurredOn)} · ${time} UTC`;
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  const book = overdueBook(customer.invoices);
  const lastActivity = (invoice: (typeof book)[number]) => {
    const latest = invoice.activities.reduce<Date | null>(
      (max, activity) => (!max || activity.occurredOn > max ? activity.occurredOn : max),
      null,
    );
    return latest ? formatDate(latest) : "—";
  };

  const feed: ActivityItem[] = customer.activities.map((activity) => ({
    id: activity.id,
    type: activity.type,
    status: activity.status,
    actorName: activity.actorName,
    channel: activity.channel,
    recipient: activity.recipient,
    methodLabel: activity.method ? paymentMethodLabel(activity.method) : null,
    amountLabel: activity.amountCents === null ? null : accountUsd(activity.amountCents, customer.plan),
    message: activity.message,
    timestamp: formatTimestamp(activity.occurredOn, activity.createdAt),
    createdAt: activity.createdAt.toISOString(),
    invoice: activity.invoice,
    note: activity.note
      ? {
          id: activity.note.id,
          body: activity.note.body,
          authorName: activity.note.authorName,
          createdAt: activity.note.createdAt.toISOString(),
        }
      : null,
  }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Account"
        title={customer.name}
        description={`${safePlanLabel(customer.plan)} · ${customer.contactName} · ${customer.email}`}
        actions={
          <NudgeButton
            invoiceId={book[0]?.id ?? null}
            invoiceNumber={book[0]?.number}
            label="Nudge most past due"
            variant="default"
          />
        }
      />

      <Card className="overflow-hidden py-0">
        <CardHeader className="px-5 pt-5">
          <CardTitle>Overdue book</CardTitle>
          <CardDescription>
            Overdue invoices for this account, most days past due first, against the 23 Aug 2026 clock.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto px-0 pb-2">
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
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {book.map((invoice) => (
                  <TableRow key={invoice.id} data-overdue-row={invoice.number}>
                    <TableCell>
                      <Link href={`/invoices/${invoice.id}`} className="font-mono text-[13px] font-medium hover:underline">
                        {invoice.number}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(invoice.issuedOn)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(invoice.dueOn)}</TableCell>
                    <TableCell className="text-right">{daysPastDue(invoice)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {accountUsd(outstandingCents(invoice), customer.plan)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{lastActivity(invoice)}</TableCell>
                    <TableCell className="text-right">
                      <NudgeButton invoiceId={invoice.id} invoiceNumber={invoice.number} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Add a note</CardTitle>
            <CardDescription>Saved to the account feed as {DEMO_OPERATOR.name}. Editable for 15 minutes.</CardDescription>
          </CardHeader>
          <CardContent>
            <NoteForm
              customerId={customer.id}
              invoices={customer.invoices
                .filter((invoice) => invoice.status !== "VOID" && invoice.status !== "DRAFT")
                .map((invoice) => ({ id: invoice.id, number: invoice.number }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Notes, Nudges, and payments, newest first.</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={feed} operatorName={DEMO_OPERATOR.name} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
