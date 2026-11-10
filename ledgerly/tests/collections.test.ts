import { describe, expect, it } from "vitest";
import { demoDay } from "@/lib/clock";
import {
  accountUsd,
  canEditNote,
  isEmailAddress,
  nudgeMessage,
  outstandingCents,
  overdueBook,
} from "@/lib/collections";
import { catalogMrrCents, collectionsKpi } from "@/lib/dashboard";
import { AMOUNTS_MASKED_COPY, PLAN_PRICE_CENTS, amountsVisible } from "@/lib/plans";

describe("overdue book", () => {
  it("keeps only OVERDUE invoices, most days past due first", () => {
    const book = overdueBook([
      { number: "A", status: "OVERDUE", dueOn: demoDay("2026-08-12") },
      { number: "B", status: "OPEN", dueOn: demoDay("2026-07-01") },
      { number: "C", status: "OVERDUE", dueOn: demoDay("2026-08-04") },
    ]);
    expect(book.map((invoice) => invoice.number)).toEqual(["C", "A"]);
  });

  it("subtracts recorded payments from the catalog total", () => {
    expect(outstandingCents({ totalCents: PLAN_PRICE_CENTS.SCALE, payments: [] })).toBe(24900);
    expect(outstandingCents({ totalCents: 24900, payments: [{ amountCents: 24900 }] })).toBe(0);
  });
});

describe("amount masking", () => {
  it("shows amounts only on Starter, Growth, and Scale", () => {
    expect(amountsVisible("STARTER")).toBe(true);
    expect(amountsVisible("GROWTH")).toBe(true);
    expect(amountsVisible("SCALE")).toBe(true);
    expect(amountsVisible("PILOT")).toBe(false);
  });

  it("formats catalog accounts with formatUsd and masks others", () => {
    expect(accountUsd(24900, "SCALE")).toBe("$249.00");
    expect(accountUsd(24900, "PILOT")).toBe(AMOUNTS_MASKED_COPY);
  });
});

describe("nudge", () => {
  it("names the invoice number, outstanding balance, and due date", () => {
    const message = nudgeMessage({ number: "INV-2003", dueOn: demoDay("2026-08-04"), outstandingCents: 24900 });
    expect(message).toContain("INV-2003");
    expect(message).toContain("$249.00");
    expect(message).toContain("Aug 4, 2026");
  });

  it("treats a missing or malformed address as not emailable", () => {
    expect(isEmailAddress("finance@alderbio.example")).toBe(true);
    expect(isEmailAddress("")).toBe(false);
    expect(isEmailAddress("finance at alderbio")).toBe(false);
  });
});

describe("collection note edit window", () => {
  const createdAt = new Date("2026-11-10T12:00:00.000Z");

  it("allows the author inside 15 minutes", () => {
    expect(canEditNote({ authorName: "Avery Quinn", createdAt }, "Avery Quinn", new Date("2026-11-10T12:14:00.000Z"))).toBe(true);
  });

  it("refuses after 15 minutes or for another author", () => {
    expect(canEditNote({ authorName: "Avery Quinn", createdAt }, "Avery Quinn", new Date("2026-11-10T12:15:00.000Z"))).toBe(false);
    expect(canEditNote({ authorName: "Another operator", createdAt }, "Avery Quinn", new Date("2026-11-10T12:01:00.000Z"))).toBe(false);
  });
});

describe("collections KPI", () => {
  const invoices = [
    { status: "OVERDUE", totalCents: 24900, customer: { plan: "SCALE" }, payments: [] },
    { status: "OVERDUE", totalCents: 9900, customer: { plan: "GROWTH" }, payments: [] },
    { status: "OPEN", totalCents: 4900, customer: { plan: "STARTER" }, payments: [] },
  ];
  const activities = [
    { occurredOn: demoDay("2026-08-23") },
    { occurredOn: demoDay("2026-08-18") },
    { occurredOn: demoDay("2026-08-10") },
  ];

  it("totals overdue catalog cents and counts today and the last 7 days", () => {
    expect(collectionsKpi({ invoices, activities })).toEqual({
      overdueCount: 2,
      overdueCents: 24900 + 9900,
      amountsVisible: true,
      activitiesToday: 1,
      activitiesThisWeek: 2,
    });
  });

  it("leaves an off-catalog account out of MRR instead of failing the dashboard", () => {
    expect(catalogMrrCents([{ plan: "SCALE" }, { plan: "PILOT" }])).toBe(PLAN_PRICE_CENTS.SCALE);
  });

  it("masks the total when an overdue account is off the catalog", () => {
    const kpi = collectionsKpi({
      invoices: [...invoices, { status: "OVERDUE", totalCents: 9900, customer: { plan: "PILOT" }, payments: [] }],
      activities,
    });
    expect(kpi.amountsVisible).toBe(false);
    expect(kpi.overdueCount).toBe(3);
    expect(kpi.overdueCents).toBe(24900 + 9900);
  });
});
