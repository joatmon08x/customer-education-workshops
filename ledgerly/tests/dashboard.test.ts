import { describe, expect, it } from "vitest";
import { DEMO_AS_OF, demoDay } from "@/lib/clock";
import {
  catalogMrrCents,
  collectionsActivityCounts,
  overdueTotals,
  percentChange,
} from "@/lib/dashboard";

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

describe("overdueTotals", () => {
  it("sums catalog cents on OVERDUE invoices only", () => {
    expect(
      overdueTotals([
        { status: "OVERDUE", totalCents: 24900 },
        { status: "OVERDUE", totalCents: 9900 },
        { status: "OPEN", totalCents: 4900 },
        { status: "PAID", totalCents: 24900 },
      ]),
    ).toEqual({ overdueCount: 2, overdueCents: 24900 + 9900 });
  });
});

describe("collectionsActivityCounts", () => {
  it("counts demo-day and 7-day window ending DEMO_AS_OF", () => {
    expect(
      collectionsActivityCounts(
        [
          { occurredOn: DEMO_AS_OF },
          { occurredOn: DEMO_AS_OF },
          { occurredOn: demoDay("2026-08-17") },
          { occurredOn: demoDay("2026-08-16") },
          { occurredOn: demoDay("2026-08-10") },
        ],
        DEMO_AS_OF,
      ),
    ).toEqual({ todayCount: 2, weekCount: 3 });
  });
});
