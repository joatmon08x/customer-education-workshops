import { describe, expect, it } from "vitest";
import { catalogMrrCents, collectionsAmountsVisible } from "@/lib/dashboard";
import { formatUsd } from "@/lib/money";
import { nudgeTemplate } from "@/lib/nudge";
import {
  AMOUNTS_MASKED_LABEL,
  PLAN_IDS,
  PLAN_PRICE_CENTS,
  amountsVisible,
  formatPlanAmount,
  maskPlanAmounts,
} from "@/lib/plans";

const OFF_CATALOG = "NOT_IN_CATALOG";

describe("amountsVisible", () => {
  it("is true only for Starter, Growth, and Scale", () => {
    for (const plan of PLAN_IDS) expect(amountsVisible(plan)).toBe(true);
    expect(amountsVisible(OFF_CATALOG)).toBe(false);
    expect(amountsVisible("")).toBe(false);
  });

  it("formats catalog amounts with formatUsd and masks off-catalog ones", () => {
    expect(formatPlanAmount("SCALE", PLAN_PRICE_CENTS.SCALE)).toBe(formatUsd(PLAN_PRICE_CENTS.SCALE));
    expect(formatPlanAmount(OFF_CATALOG, PLAN_PRICE_CENTS.SCALE)).toBe(AMOUNTS_MASKED_LABEL);
    expect(AMOUNTS_MASKED_LABEL).toBe("Upgrade to view amounts");
  });

  it("masks the balance in a sent Nudge body but keeps the rest of the copy", () => {
    const { body } = nudgeTemplate({
      number: "INV-1043",
      outstandingCents: PLAN_PRICE_CENTS.SCALE,
      dueOn: new Date("2026-08-09T00:00:00Z"),
    });
    expect(maskPlanAmounts("SCALE", body)).toBe(body);
    const masked = maskPlanAmounts(OFF_CATALOG, body);
    expect(masked).not.toContain("$");
    expect(masked).toContain(`balance of ${AMOUNTS_MASKED_LABEL}`);
    expect(masked).toContain("INV-1043");
  });
});

describe("dashboard with an off-catalog account", () => {
  it("masks the collections total when any overdue invoice is off-catalog and keeps MRR on catalog prices", () => {
    expect(
      collectionsAmountsVisible([
        { status: "OVERDUE", customer: { plan: "GROWTH" } },
        { status: "OPEN", customer: { plan: OFF_CATALOG } },
      ]),
    ).toBe(true);
    expect(
      collectionsAmountsVisible([
        { status: "OVERDUE", customer: { plan: "GROWTH" } },
        { status: "OVERDUE", customer: { plan: OFF_CATALOG } },
      ]),
    ).toBe(false);
    expect(catalogMrrCents([{ plan: "STARTER" }, { plan: OFF_CATALOG }])).toBe(PLAN_PRICE_CENTS.STARTER);
  });
});
