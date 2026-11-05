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
import { getCustomerAccounts } from "@/lib/data";
import { formatPlanAmount, planWithPrice } from "@/lib/plans";

export const metadata = {
  title: "Customers",
};

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const accounts = await getCustomerAccounts();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Accounts"
        title="Customers"
        description="Seeded Fieldnote book only. Open an account to work its overdue invoices against the frozen 23 Aug 2026 clock."
      />

      {accounts.length === 0 ? (
        <EmptyState
          title="No accounts in this book"
          body="Reseed the Fieldnote workspace. Catalog stays Starter $49, Growth $99, Scale $249."
          imageSrc="/images/empty-invoices.svg"
          imageAlt="Empty invoice folder illustration"
        />
      ) : (
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
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      <Link href={`/customers/${account.id}`} className="hover:underline">
                        {account.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {planWithPrice(account.plan)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{account.overdueCount}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatPlanAmount(account.plan, account.overdueBalanceCents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
