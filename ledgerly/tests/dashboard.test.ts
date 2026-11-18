import { describe, expect, it } from "vitest";
import { DEMO_AS_OF, demoDay } from "@/lib/clock";
import {
  activityCountInDaysEnding,
  activityCountOnDay,
  catalogMrrCents,
  collectionsOverdueTotals,
  percentChange,
} from "@/lib/dashboard";
import { PLAN_PRICE_CENTS } from "@/lib/plans";

describe("catalogMrrCents", () => {
  it("sums only catalog plan prices", () => {
    expect(
      catalogMrrCents([{ plan: "STARTER" }, { plan: "GROWTH" }, { plan: "SCALE" }]),
    ).toBe(4900 + 9900 + 24900);
  });
});

describe("collectionsOverdueTotals", () => {
  it("counts OVERDUE invoices and sums outstandingCents catalog amounts", () => {
    expect(
      collectionsOverdueTotals([
        { status: "OVERDUE", totalCents: PLAN_PRICE_CENTS.SCALE },
        { status: "OPEN", totalCents: PLAN_PRICE_CENTS.GROWTH },
        { status: "OVERDUE", totalCents: PLAN_PRICE_CENTS.STARTER },
        { status: "PAID", totalCents: PLAN_PRICE_CENTS.SCALE },
      ]),
    ).toEqual({
      invoiceCount: 2,
      balanceCents: PLAN_PRICE_CENTS.SCALE + PLAN_PRICE_CENTS.STARTER,
    });
  });
});

describe("collections activity windows", () => {
  it("counts the demo day separately from the 7 days ending that day", () => {
    const activities = [
      { occurredOn: DEMO_AS_OF },
      { occurredOn: demoDay("2026-08-20") },
      { occurredOn: demoDay("2026-08-17") },
      { occurredOn: demoDay("2026-08-16") },
    ];
    expect(activityCountOnDay(activities, DEMO_AS_OF)).toBe(1);
    expect(activityCountInDaysEnding(activities, DEMO_AS_OF, 7)).toBe(3);
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
