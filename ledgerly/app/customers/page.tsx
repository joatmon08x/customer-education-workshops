import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { accountUsd, outstandingCents, safePlanLabel } from "@/lib/collections";
import { getCustomers } from "@/lib/data";
import { sumCents } from "@/lib/money";

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
        description="Every account in the Fieldnote book. Open one to work its overdue book against the 23 Aug 2026 clock."
      />

      <Card className="overflow-hidden py-0">
        <CardContent className="px-0">
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
                const overdue = customer.invoices.filter((invoice) => invoice.status === "OVERDUE");
                const balance = sumCents(overdue.map((invoice) => outstandingCents(invoice)));
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Link href={`/customers/${customer.id}`} className="font-medium hover:underline">
                        {customer.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{customer.contactName}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{safePlanLabel(customer.plan)}</TableCell>
                    <TableCell className="text-right">{overdue.length}</TableCell>
                    <TableCell className="text-right font-medium">
                      {accountUsd(balance, customer.plan)}
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
