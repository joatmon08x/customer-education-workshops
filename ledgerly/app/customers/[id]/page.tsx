import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { NoteBody } from "@/components/customers/note-body";
import { NoteComposer } from "@/components/customers/note-composer";
import { NudgeButton } from "@/components/nudge-button";
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
import { canEditNote, formatNoteTime, getAccountNotes, noteIdFromPayload } from "@/lib/account-notes";
import { getAccountActivities, lastActivityByInvoice } from "@/lib/activity";
import { DEMO_AS_OF } from "@/lib/clock";
import { overdueBook } from "@/lib/collections";
import { getCustomer } from "@/lib/data";
import { formatDate } from "@/lib/dates";
import { accountNudgeTarget, parseNudgePayload } from "@/lib/nudge";
import { paymentMethodLabel } from "@/lib/payment-methods";
import { paymentFromPayload } from "@/lib/payments";
import { formatPlanAmount, isPlanId, maskPlanAmounts, planLabel } from "@/lib/plans";

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
  const accountNudge = accountNudgeTarget(customer.invoices, DEMO_AS_OF);
  const notes = new Map((await getAccountNotes(customer.id)).map((note) => [note.id, note]));
  const now = new Date();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Account"
        title={customer.name}
        description={`${isPlanId(customer.plan) ? planLabel(customer.plan) : customer.plan} · ${customer.contactName} · ${customer.email}`}
      />

      <Card className="overflow-hidden py-0">
        <CardHeader className="flex flex-row items-start justify-between gap-4 px-5 pt-5">
          <div className="grid gap-1.5">
            <CardTitle>Overdue Book</CardTitle>
            <CardDescription>
              OVERDUE invoices for this account, most days past due first. Aged against 23 Aug 2026.
            </CardDescription>
          </div>
          <NudgeButton
            label="Nudge account"
            invoiceId={accountNudge?.id}
            invoiceNumber={accountNudge?.number}
            disabled={!accountNudge}
          />
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
                  <TableHead className="text-right">Nudge</TableHead>
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
                        {formatPlanAmount(customer.plan, invoice.outstandingCents)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{last ? formatDate(last) : "—"}</TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <NudgeButton invoiceId={invoice.id} invoiceNumber={invoice.number} />
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
        <CardContent className="space-y-5">
          <NoteComposer
            customerId={customer.id}
            invoices={customer.invoices.map((invoice) => ({ id: invoice.id, number: invoice.number }))}
          />
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity on this account yet.</p>
          ) : (
            <ol className="space-y-3" aria-label="Account activity">
              {activities.map((activity) => {
                const nudge = activity.type === "NUDGE_SENT" ? parseNudgePayload(activity.payload) : null;
                const payment = activity.type === "PAYMENT_RECORDED" ? paymentFromPayload(activity.payload) : null;
                const note = activity.type === "NOTE_ADDED" ? notes.get(noteIdFromPayload(activity.payload) ?? "") : undefined;
                return (
                  <li key={activity.id} className="space-y-1 text-sm">
                    <p className="font-medium">
                      {activity.type} ·{" "}
                      <span className={activity.status === "failed" ? "text-danger" : undefined}>
                        {activity.status}
                      </span>
                      {activity.channel ? ` · ${activity.channel}` : ""}
                      {activity.invoice ? ` · ${activity.invoice.number}` : ""}
                    </p>
                    {payment ? (
                      <p>
                        {formatPlanAmount(customer.plan, payment.amountCents)} · {paymentMethodLabel(payment.method)}
                      </p>
                    ) : null}
                    {note ? <NoteBody noteId={note.id} body={note.body} editable={canEditNote(note, now)} /> : null}
                    <p className="text-muted-foreground">
                      {activity.actorName} · {formatDate(activity.occurredOn)}
                      {nudge?.to ? ` · to ${nudge.to}` : ""}
                      {note ? ` · saved ${formatNoteTime(note.createdAt)} UTC` : ""}
                    </p>
                    {nudge ? <p className="mt-1">{maskPlanAmounts(customer.plan, nudge.body)}</p> : null}
                    {nudge?.error ? <p className="mt-1 text-danger">Not sent: {nudge.error}</p> : null}
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
