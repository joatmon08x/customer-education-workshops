import { describe, expect, it } from "vitest";
import { DEMO_AS_OF } from "@/lib/clock";
import { catalogMrrCents, collectionsTotals, percentChange } from "@/lib/dashboard";

describe("catalogMrrCents", () => {
  it("sums only catalog plan prices", () => {
    expect(
      catalogMrrCents([{ plan: "STARTER" }, { plan: "GROWTH" }, { plan: "SCALE" }]),
    ).toBe(4900 + 9900 + 24900);
  });
});

describe("percentChange", () => {
  it("returns null when the prior period is empty and current is not", () => {
    expect(percentChange(9900, 0)).toBeNull();
  });

  it("computes a real lift without inventing a baseline", () => {
    expect(percentChange(19800, 9900)).toBe(100);
  });
});

describe("collectionsTotals", () => {
  it("sums overdue catalog cents and counts OVERDUE invoices only", () => {
    expect(
      collectionsTotals(
        [
          { status: "OVERDUE", totalCents: 24900 },
          { status: "OVERDUE", totalCents: 9900, payments: [{ amountCents: 9900 }] },
          { status: "OPEN", totalCents: 4900 },
          { status: "PAID", totalCents: 24900 },
        ],
        [],
      ),
    ).toEqual({
      overdueBalanceCents: 24900,
      overdueInvoiceCount: 2,
      activitiesToday: 0,
      activitiesLast7Days: 0,
    });
  });

  it("counts activities on DEMO_AS_OF and in the 7 days ending that day", () => {
    const totals = collectionsTotals(
      [],
      [
        { occurredOn: DEMO_AS_OF },
        { occurredOn: new Date("2026-08-17T12:00:00.000Z") },
        { occurredOn: new Date("2026-08-16T12:00:00.000Z") },
        { occurredOn: new Date("2026-08-24T12:00:00.000Z") },
      ],
    );

    expect(totals.activitiesToday).toBe(1);
    expect(totals.activitiesLast7Days).toBe(2);
  });
});
