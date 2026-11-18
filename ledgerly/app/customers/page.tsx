import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEMO_AS_OF } from "@/lib/clock";
import { overdueBook } from "@/lib/collections";
import { getCustomers } from "@/lib/data";
import { formatUsd, sumCents } from "@/lib/money";
import { planLabel } from "@/lib/plans";

export const metadata = {
  title: "Customers",
};

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Accounts"
        title="Customers"
        description="Seeded Fieldnote accounts. Open one to work its overdue book against the frozen 23 Aug 2026 clock."
      />

      <Card className="overflow-hidden py-0">
        <CardContent className="px-0 py-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Overdue invoices</TableHead>
                <TableHead className="text-right">Overdue balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => {
                const book = overdueBook(customer.invoices, DEMO_AS_OF);
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Link href={`/customers/${customer.id}`} className="font-medium hover:underline">
                        {customer.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{planLabel(customer.plan)}</TableCell>
                    <TableCell className="text-right">{book.length}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatUsd(sumCents(book.map((invoice) => invoice.outstandingCents)))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
