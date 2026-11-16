import Link from "next/link";
import { notFound } from "next/navigation";
import { Amount, maskedOrUsd } from "@/components/amount";
import { EditableNote } from "@/components/collections/editable-note";
import { NoteComposer } from "@/components/collections/note-composer";
import { NudgeButton } from "@/components/collections/nudge-button";
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
import {
  canEditNote,
  daysPastDue,
  isPaymentMethod,
  nudgeTemplate,
  outstandingCents,
  overdueBook,
  PAYMENT_METHOD_LABEL,
} from "@/lib/collections";
import { getCustomer } from "@/lib/data";
import { formatDate } from "@/lib/dates";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { amountsVisible, isPlanId, planLabel } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(id);
  return { title: customer ? customer.name : "Account" };
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(value);
}

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  const visible = amountsVisible(customer.plan);
  const book = overdueBook(customer.invoices);
  const mostPastDue = book[0] ?? null;
  const now = new Date();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Account"
        title={customer.name}
        description={`${isPlanId(customer.plan) ? planLabel(customer.plan) : customer.plan} · ${customer.contactName} · ${customer.email || "no email on file"}`}
        actions={<NudgeButton invoiceId={mostPastDue?.id ?? null} label="Nudge account" variant="default" size="default" />}
      />

      <Card className="overflow-hidden py-0">
        <CardHeader className="px-5 pt-5">
          <CardTitle>Overdue Book</CardTitle>
          <CardDescription>
            Overdue invoices for this account, most days past due first. Clock frozen 23 Aug 2026.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          {book.length === 0 ? (
            <p className="px-5 pb-4 text-sm text-muted-foreground">Nothing is overdue on this account.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-5">Invoice</TableHead>
                  <TableHead>Invoice date</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead className="text-right">Days past due</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead>Last activity</TableHead>
                  <TableHead className="px-5 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {book.map((invoice) => {
                  const last = invoice.activities.reduce<Date | null>(
                    (latest, activity) =>
                      !latest || activity.occurredOn > latest ? activity.occurredOn : latest,
                    null,
                  );
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="px-5 py-3">
                        <Link href={`/invoices/${invoice.id}`} className="font-mono font-medium hover:underline">
                          {invoice.number}
                        </Link>
                      </TableCell>
                      <TableCell>{formatDate(invoice.issuedOn)}</TableCell>
                      <TableCell>{formatDate(invoice.dueOn)}</TableCell>
                      <TableCell className="text-right">{daysPastDue(invoice)}</TableCell>
                      <TableCell className="text-right font-medium">
                        <Amount cents={outstandingCents(invoice)} visible={visible} />
                      </TableCell>
                      <TableCell>{last ? formatDate(last) : "—"}</TableCell>
                      <TableCell className="px-5 text-right">
                        <NudgeButton invoiceId={invoice.id} label={`Nudge ${invoice.number}`} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Add a note</CardTitle>
            <CardDescription>Saved to this account&apos;s activity as {DEMO_OPERATOR.name}.</CardDescription>
          </CardHeader>
          <CardContent>
            <NoteComposer
              customerId={customer.id}
              invoices={customer.invoices
                .filter((invoice) => invoice.status !== "VOID")
                .map((invoice) => ({ id: invoice.id, number: invoice.number }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Notes, Nudges, and payments on this account, newest first.</CardDescription>
          </CardHeader>
          <CardContent>
            {customer.activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No collections activity yet.</p>
            ) : (
              <ol className="space-y-4">
                {customer.activities.map((activity) => (
                  <li key={activity.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono font-medium text-foreground">{activity.type}</span>
                      {activity.status === "failed" ? (
                        <Badge variant="danger">Failed</Badge>
                      ) : activity.type === "NUDGE_SENT" ? (
                        <Badge variant="success">Sent</Badge>
                      ) : null}
                      <span>
                        {activity.actorName} · {formatDate(activity.occurredOn)} · {formatTime(activity.createdAt)}
                      </span>
                      {activity.invoice ? (
                        <Link href={`/invoices/${activity.invoice.id}`} className="font-mono hover:underline">
                          {activity.invoice.number}
                        </Link>
                      ) : null}
                    </div>
                    <div className="mt-1.5">
                      {activity.type === "NOTE_ADDED" && activity.note ? (
                        <EditableNote
                          noteId={activity.note.id}
                          body={activity.note.body}
                          editable={canEditNote(activity.note, DEMO_OPERATOR.name, now)}
                        />
                      ) : null}
                      {activity.type === "NUDGE_SENT" ? (
                        <div className="space-y-1 text-sm">
                          {activity.status === "failed" ? (
                            <p role="status" className="font-medium text-danger">
                              Not delivered — {activity.recipient ? `“${activity.recipient}” is not an email address` : "no email on file"}.
                            </p>
                          ) : (
                            <p className="text-muted-foreground">
                              Emailed to {activity.recipient}
                            </p>
                          )}
                          {activity.invoice ? (
                            <p>
                              {nudgeTemplate({
                                invoiceNumber: activity.invoice.number,
                                balance: maskedOrUsd(activity.amountCents ?? 0, visible),
                                dueOn: activity.invoice.dueOn,
                              })}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      {activity.type === "PAYMENT_RECORDED" ? (
                        <p className="text-sm">
                          Payment recorded: <Amount cents={activity.amountCents ?? 0} visible={visible} /> by{" "}
                          {activity.method && isPaymentMethod(activity.method)
                            ? PAYMENT_METHOD_LABEL[activity.method]
                            : activity.method}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
