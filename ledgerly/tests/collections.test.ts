import { describe, expect, it } from "vitest";
import { maskedOrUsd, MASKED_AMOUNT_LABEL } from "@/components/amount";
import { DEMO_AS_OF, demoDay } from "@/lib/clock";
import {
  canEditNote,
  isEmailAddress,
  nudgeTemplate,
  outstandingCents,
  overdueBook,
} from "@/lib/collections";
import { collectionsKpi } from "@/lib/dashboard";
import { amountsVisible, PLAN_PRICE_CENTS } from "@/lib/plans";

describe("amountsVisible", () => {
  it("shows amounts only on Starter, Growth, and Scale", () => {
    expect(["STARTER", "GROWTH", "SCALE"].map(amountsVisible)).toEqual([true, true, true]);
    expect(amountsVisible("COMPLIMENTARY")).toBe(false);
    expect(maskedOrUsd(PLAN_PRICE_CENTS.SCALE, false)).toBe(MASKED_AMOUNT_LABEL);
    expect(maskedOrUsd(PLAN_PRICE_CENTS.SCALE, true)).toBe("$249.00");
  });
});

describe("overdue book", () => {
  it("lists only OVERDUE invoices, most days past due first, with balance net of payments", () => {
    const rows = [
      { id: "a", status: "OVERDUE", dueOn: demoDay("2026-08-12") },
      { id: "b", status: "OPEN", dueOn: demoDay("2026-08-01") },
      { id: "c", status: "OVERDUE", dueOn: demoDay("2026-08-04") },
    ];
    expect(overdueBook(rows).map((row) => row.id)).toEqual(["c", "a"]);
    expect(outstandingCents({ totalCents: 9900, payments: [] })).toBe(9900);
    expect(outstandingCents({ totalCents: 9900, payments: [{ amountCents: 9900 }] })).toBe(0);
  });
});

describe("nudge", () => {
  it("uses the fixed template and rejects addresses that cannot be emailed", () => {
    const message = nudgeTemplate({
      invoiceNumber: "INV-1043",
      balance: "$249.00",
      dueOn: demoDay("2026-08-09"),
    });
    expect(message).toContain("INV-1043");
    expect(message).toContain("$249.00");
    expect(message).toContain("Aug 9, 2026");
    expect(isEmailAddress("accounts@cobaltgoods.example")).toBe(true);
    expect(isEmailAddress("")).toBe(false);
    expect(isEmailAddress("cobalt goods")).toBe(false);
  });
});

describe("note edit window", () => {
  it("lets the author edit for 15 minutes only", () => {
    const now = new Date("2026-11-16T12:00:00.000Z");
    const fresh = { authorName: "Avery Quinn", createdAt: new Date(now.getTime() - 14 * 60_000) };
    const stale = { authorName: "Avery Quinn", createdAt: new Date(now.getTime() - 16 * 60_000) };
    expect(canEditNote(fresh, "Avery Quinn", now)).toBe(true);
    expect(canEditNote(stale, "Avery Quinn", now)).toBe(false);
    expect(canEditNote({ ...fresh, authorName: "Someone Else" }, "Avery Quinn", now)).toBe(false);
  });
});

describe("collectionsKpi", () => {
  it("totals overdue catalog cents and counts today and the trailing 7 days", () => {
    const kpi = collectionsKpi(
      [
        { status: "OVERDUE", totalCents: PLAN_PRICE_CENTS.SCALE, customer: { plan: "SCALE" } },
        { status: "OVERDUE", totalCents: PLAN_PRICE_CENTS.GROWTH, customer: { plan: "GROWTH" } },
        { status: "PAID", totalCents: PLAN_PRICE_CENTS.STARTER, customer: { plan: "STARTER" } },
      ],
      [{ occurredOn: DEMO_AS_OF }, { occurredOn: demoDay("2026-08-18") }, { occurredOn: demoDay("2026-08-10") }],
    );
    expect(kpi).toEqual({
      overdueCents: 24900 + 9900,
      overdueCount: 2,
      amountsVisible: true,
      activitiesToday: 1,
      activitiesWeek: 2,
    });
  });

  it("masks the overdue total when an overdue account is off the catalog", () => {
    const kpi = collectionsKpi(
      [{ status: "OVERDUE", totalCents: PLAN_PRICE_CENTS.GROWTH, customer: { plan: "COMPLIMENTARY" } }],
      [],
    );
    expect(kpi.amountsVisible).toBe(false);
    expect(kpi.overdueCount).toBe(1);
  });
});
