import { describe, expect, it } from "vitest";
import { lastActivityByInvoice } from "@/lib/activity";
import { DEMO_AS_OF, demoDay } from "@/lib/clock";
import { overdueBook } from "@/lib/collections";
import { PLAN_PRICE_CENTS } from "@/lib/plans";

const invoice = (id: string, status: string, dueOn: string, totalCents: number) => ({
  id,
  status,
  dueOn: demoDay(dueOn),
  totalCents,
});

describe("overdueBook", () => {
  it("lists only OVERDUE invoices, most days past due first", () => {
    const book = overdueBook(
      [
        invoice("inv_a", "OVERDUE", "2026-08-12", PLAN_PRICE_CENTS.GROWTH),
        invoice("inv_b", "OPEN", "2026-08-01", PLAN_PRICE_CENTS.STARTER),
        invoice("inv_c", "OVERDUE", "2026-08-04", PLAN_PRICE_CENTS.SCALE),
        invoice("inv_d", "PAID", "2026-07-01", PLAN_PRICE_CENTS.SCALE),
      ],
      DEMO_AS_OF,
    );
    expect(book.map((row) => row.id)).toEqual(["inv_c", "inv_a"]);
  });

  it("ages against the demo clock and carries the catalog total as outstanding", () => {
    const [row] = overdueBook([invoice("inv_1043", "OVERDUE", "2026-08-09", PLAN_PRICE_CENTS.SCALE)], DEMO_AS_OF);
    expect(row.daysPastDue).toBe(14);
    expect(row.outstandingCents).toBe(24900);
  });

  it("is empty for an account with no OVERDUE invoices", () => {
    expect(overdueBook([invoice("inv_1041", "OPEN", "2026-09-06", PLAN_PRICE_CENTS.GROWTH)], DEMO_AS_OF)).toEqual([]);
  });
});

describe("lastActivityByInvoice", () => {
  it("keeps the latest occurredOn per invoice and skips account-level rows", () => {
    const latest = lastActivityByInvoice([
      { invoiceId: "inv_1043", occurredOn: demoDay("2026-08-20") },
      { invoiceId: "inv_1043", occurredOn: demoDay("2026-08-23") },
      { invoiceId: null, occurredOn: demoDay("2026-08-23") },
    ]);
    expect(latest.get("inv_1043")).toEqual(demoDay("2026-08-23"));
    expect(latest.size).toBe(1);
  });
});
