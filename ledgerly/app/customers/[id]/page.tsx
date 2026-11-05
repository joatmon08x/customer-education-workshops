import Link from "next/link";
import { notFound } from "next/navigation";
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
import { getCustomerAccount } from "@/lib/data";
import { formatDate } from "@/lib/dates";
import { formatUsd } from "@/lib/money";
import { isPlanId, planLabel, planPriceCents } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await getCustomerAccount(id);
  return { title: account ? account.name : "Account" };
}

export default async function CustomerAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await getCustomerAccount(id);
  if (!account) notFound();
  if (!isPlanId(account.plan)) notFound();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Account"
        title={account.name}
        description={`${planLabel(account.plan)} · ${formatUsd(planPriceCents(account.plan))} · last activity ${account.lastActivity}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>{account.contactName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>{account.email}</p>
          <p className="text-muted-foreground">Plan on file: {planLabel(account.plan)}</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden py-0">
        <CardHeader className="px-5 pt-5">
          <CardTitle>Overdue Book</CardTitle>
          <CardDescription>
            OVERDUE invoices for this account only. Days past due use the 23 Aug 2026 demo clock.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-4">
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
              {account.overdueBook.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="font-mono text-[13px] font-medium hover:underline"
                    >
                      {invoice.number}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(invoice.issuedOn)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(invoice.dueOn)}</TableCell>
                  <TableCell className="text-right tabular-nums">{invoice.daysPastDue}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatUsd(invoice.outstandingCents)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{invoice.lastActivity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {account.overdueBook.length === 0 ? (
            <p className="px-5 pt-2 text-sm text-muted-foreground">No overdue invoices.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
