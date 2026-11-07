import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
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
import { getCustomers } from "@/lib/data";
import { formatPlanAmount, planDisplayName } from "@/lib/plans";

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
        description="Seeded Fieldnote accounts. Open an account for its Overdue Book. Catalog stays Starter $49, Growth $99, Scale $249."
      />

      {customers.length === 0 ? (
        <EmptyState
          title="No customers in this book"
          body="Re-seed the Fieldnote workspace to restore the demo accounts."
          imageSrc="/images/empty-invoices.svg"
          imageAlt="Empty folder illustration"
        />
      ) : (
        <Card className="overflow-hidden py-0">
          <CardContent className="px-0 py-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Overdue invoices</TableHead>
                  <TableHead className="text-right">Overdue balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => {
                  const overdue = customer.invoices.filter((invoice) => invoice.status === "OVERDUE");
                  const overdueBalanceCents = overdue.reduce(
                    (total, invoice) => total + invoice.totalCents,
                    0,
                  );
                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <Link
                          href={`/customers/${customer.id}`}
                          className="font-medium hover:underline"
                        >
                          {customer.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {planDisplayName(customer.plan)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{overdue.length}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatPlanAmount(customer.plan, overdueBalanceCents)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
