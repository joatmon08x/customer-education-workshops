import { describe, expect, it } from "vitest";
import {
  AMOUNTS_MASKED_LABEL,
  PLAN_PRICE_CENTS,
  amountsVisible,
  formatPlanAmount,
  maskPlanAmountIn,
  planLabel,
  planPriceCents,
} from "@/lib/plans";
import { prisma } from "@/lib/prisma";

describe("plan catalog", () => {
  it("exposes only the three demo prices", () => {
    expect(PLAN_PRICE_CENTS).toEqual({
      STARTER: 4900,
      GROWTH: 9900,
      SCALE: 24900,
    });
  });

  it("labels plans without mentioning a made-up tier", () => {
    expect(planLabel("STARTER")).toBe("Starter");
    expect(planPriceCents("GROWTH")).toBe(9900);
  });

  it("refuses unknown plans instead of inventing a price", () => {
    expect(() => planPriceCents("ENTERPRISE")).toThrow(/Unknown plan/);
  });
});

describe("amountsVisible", () => {
  it("is true only for Starter, Growth, and Scale", () => {
    expect(amountsVisible("STARTER")).toBe(true);
    expect(amountsVisible("GROWTH")).toBe(true);
    expect(amountsVisible("SCALE")).toBe(true);
    for (const plan of ["LEGACY", "FREE", "TRIAL", "ENTERPRISE", "starter", ""]) {
      expect(amountsVisible(plan)).toBe(false);
    }
  });

  it("formats catalog amounts with formatUsd and masks a non-catalog id", () => {
    expect(formatPlanAmount("SCALE", 24900)).toBe("$249.00");
    expect(formatPlanAmount("LEGACY", 24900)).toBe(AMOUNTS_MASKED_LABEL);
    expect(AMOUNTS_MASKED_LABEL).toBe("Upgrade to view amounts");
  });

  it("masks the amount inside generated copy only off the catalog", () => {
    const body = "Invoice INV-1047 is outstanding for $99.00. Please remit payment.";
    expect(maskPlanAmountIn("GROWTH", body, 9900)).toBe(body);
    expect(maskPlanAmountIn("LEGACY", body, 9900)).toBe(
      "Invoice INV-1047 is outstanding for Upgrade to view amounts. Please remit payment.",
    );
    expect(maskPlanAmountIn("LEGACY", body, null)).toBe(body);
  });

  it("keeps every seeded account on the catalog", async () => {
    const customers = await prisma.customer.findMany({ select: { plan: true } });
    expect(customers.length).toBeGreaterThan(0);
    expect(customers.every((customer) => amountsVisible(customer.plan))).toBe(true);
  });
});
