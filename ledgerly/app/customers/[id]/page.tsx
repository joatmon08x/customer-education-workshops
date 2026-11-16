import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionNoteEdit } from "@/components/collection-note-edit";
import { CollectionNoteForm } from "@/components/collection-note-form";
import { PageHeader } from "@/components/page-header";
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
import { canEditCollectionNote } from "@/lib/collection-notes";
import { daysBetween, formatDate } from "@/lib/dates";
import { formatUsd } from "@/lib/money";
import { isPaymentMethod, outstandingCents, paymentMethodLabel } from "@/lib/payments";
import { isPlanId, planLabel } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  return { title: customer ? customer.name : "Customer" };
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      invoices: { include: { payments: true } },
      notes: {
        include: { invoice: true },
        orderBy: { createdAt: "desc" },
      },
      activities: {
        include: { invoice: true, note: true },
        orderBy: [{ occurredOn: "desc" }, { createdAt: "desc" }],
      },
    },
  });
  if (!customer || !isPlanId(customer.plan)) notFound();

  const latestActivityOn = new Map<string, Date>();
  for (const activity of customer.activities) {
    if (!activity.invoiceId) continue;
    const existing = latestActivityOn.get(activity.invoiceId);
    if (!existing || activity.occurredOn > existing) {
      latestActivityOn.set(activity.invoiceId, activity.occurredOn);
    }
  }

  const overdueBook = customer.invoices
    .filter((invoice) => invoice.status === "OVERDUE")
    .map((invoice) => ({
      ...invoice,
      daysPastDue: Math.max(0, daysBetween(DEMO_AS_OF, invoice.dueOn)),
      balanceCents: outstandingCents(invoice.totalCents, invoice.payments),
      lastActivityOn: latestActivityOn.get(invoice.id) ?? null,
    }))
    .sort((a, b) => b.daysPastDue - a.daysPastDue);

  const invoiceOptions = customer.invoices
    .slice()
    .sort((a, b) => a.number.localeCompare(b.number))
    .map((invoice) => ({ id: invoice.id, number: invoice.number }));

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
            Past-due invoices for this account only, oldest exposure first. Outstanding balance is
            the invoice total minus recorded payments.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-4">
          {overdueBook.length === 0 ? (
            <p className="px-5 pb-2 text-sm text-muted-foreground">
              No overdue invoices on this account.
            </p>
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
                    <TableCell className="text-muted-foreground">
                      {formatDate(invoice.dueOn)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {invoice.daysPastDue}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatUsd(invoice.balanceCents)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {invoice.lastActivityOn ? formatDate(invoice.lastActivityOn) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden py-0">
        <CardHeader className="px-5 pt-5">
          <CardTitle>Activity</CardTitle>
          <CardDescription>
            Single account feed for collections touches. Newest first. Notes stay on the account;
            editable by Avery Quinn for 15 minutes after creation.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-4">
          <CollectionNoteForm customerId={customer.id} invoices={invoiceOptions} />

          {customer.activities.length === 0 ? (
            <p className="px-5 pb-2 text-sm text-muted-foreground">
              No activity on this account yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead>Recorder</TableHead>
                  <TableHead className="w-[1%]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.activities.map((activity) => {
                  const linkedNote =
                    activity.type === "NOTE_ADDED" && activity.note ? activity.note : null;
                  const editable = linkedNote ? canEditCollectionNote(linkedNote) : false;

                  return (
                    <TableRow key={activity.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(activity.occurredOn)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{activity.type}</TableCell>
                      <TableCell className="text-sm">
                        {activity.type === "PAYMENT_RECORDED" ? (
                          <>
                            {activity.amountCents != null ? formatUsd(activity.amountCents) : "—"}
                            {activity.method
                              ? ` · ${
                                  isPaymentMethod(activity.method)
                                    ? paymentMethodLabel(activity.method)
                                    : activity.method
                                }`
                              : ""}
                            {activity.invoice ? ` · ${activity.invoice.number}` : ""}
                          </>
                        ) : activity.type === "NOTE_ADDED" ? (
                          <>
                            <span className="whitespace-pre-wrap">
                              {linkedNote?.body ?? activity.body ?? "—"}
                            </span>
                            {activity.invoice ? (
                              <span className="text-muted-foreground">
                                {" "}
                                · {activity.invoice.number}
                              </span>
                            ) : null}
                          </>
                        ) : (
                          activity.invoice?.number ?? "—"
                        )}
                      </TableCell>
                      <TableCell>{activity.actorName}</TableCell>
                      <TableCell>
                        {editable && linkedNote ? (
                          <CollectionNoteEdit
                            noteId={linkedNote.id}
                            initialBody={linkedNote.body}
                          />
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
