import Link from "next/link";
import { Amount } from "@/components/amount";
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
import { outstandingCents, overdueBook } from "@/lib/collections";
import { getCustomers } from "@/lib/data";
import { sumCents } from "@/lib/money";
import { amountsVisible, isPlanId, planLabel } from "@/lib/plans";

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
        description="Every account in the Fieldnote book. Open one to work its overdue book, notes, Nudges, and payments."
      />

      <Card className="overflow-hidden py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-5">Account</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Overdue invoices</TableHead>
                <TableHead className="px-5 text-right">Overdue balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => {
                const overdue = overdueBook(customer.invoices);
                return (
                  <TableRow key={customer.id}>
                    <TableCell className="px-5 py-3">
                      <Link href={`/customers/${customer.id}`} className="font-medium hover:underline">
                        {customer.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{customer.contactName}</p>
                    </TableCell>
                    <TableCell>{isPlanId(customer.plan) ? planLabel(customer.plan) : customer.plan}</TableCell>
                    <TableCell className="text-right">{overdue.length}</TableCell>
                    <TableCell className="px-5 text-right font-medium">
                      <Amount
                        cents={sumCents(overdue.map(outstandingCents))}
                        visible={amountsVisible(customer.plan)}
                      />
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
