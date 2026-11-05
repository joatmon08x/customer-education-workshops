import { describe, expect, it } from "vitest";
import { DEMO_AS_OF } from "@/lib/clock";
import {
  lastActivityLabel,
  NO_ACTIVITY,
  overdueBalanceCents,
  overdueBookForAccount,
  type OverdueBookInvoice,
} from "@/lib/overdue-book";

const invoices: OverdueBookInvoice[] = [
  {
    customerId: "cus_quarrypine",
    id: "inv_1043",
    number: "INV-1043",
    status: "OVERDUE",
    issuedOn: new Date("2026-07-10T12:00:00.000Z"),
    dueOn: new Date("2026-08-09T12:00:00.000Z"),
    totalCents: 24900,
  },
  {
    customerId: "cus_quarrypine",
    id: "inv_open",
    number: "INV-OPEN",
    status: "OPEN",
    issuedOn: new Date("2026-08-01T12:00:00.000Z"),
    dueOn: new Date("2026-08-31T12:00:00.000Z"),
    totalCents: 9900,
  },
  {
    customerId: "cus_alderbio",
    id: "inv_2003",
    number: "INV-2003",
    status: "OVERDUE",
    issuedOn: new Date("2026-07-05T12:00:00.000Z"),
    dueOn: new Date("2026-08-04T12:00:00.000Z"),
    totalCents: 24900,
  },
  {
    customerId: "cus_harborline",
    id: "inv_1041",
    number: "INV-1041",
    status: "OPEN",
    issuedOn: new Date("2026-08-07T12:00:00.000Z"),
    dueOn: new Date("2026-09-06T12:00:00.000Z"),
    totalCents: 9900,
  },
];

describe("overdueBookForAccount", () => {
  it("lists only that account’s OVERDUE invoices, days past due descending", () => {
    const book = overdueBookForAccount(
      [
        ...invoices,
        {
          customerId: "cus_quarrypine",
          id: "inv_older",
          number: "INV-OLDER",
          status: "OVERDUE",
          issuedOn: new Date("2026-07-01T12:00:00.000Z"),
          dueOn: new Date("2026-08-01T12:00:00.000Z"),
          totalCents: 4900,
        },
      ],
      "cus_quarrypine",
      DEMO_AS_OF,
    );

    expect(book.map((row) => row.number)).toEqual(["INV-OLDER", "INV-1043"]);
    expect(book.map((row) => row.daysPastDue)).toEqual([22, 14]);
  });

  it("uses invoice.totalCents as outstanding balance", () => {
    const book = overdueBookForAccount(invoices, "cus_quarrypine");
    expect(book).toHaveLength(1);
    expect(book[0]?.outstandingCents).toBe(24900);
    expect(overdueBalanceCents(book)).toBe(24900);
  });

  it("returns no invoice rows when the account has no OVERDUE invoices", () => {
    expect(overdueBookForAccount(invoices, "cus_harborline")).toEqual([]);
  });
});

describe("lastActivityLabel", () => {
  it("is an em dash when the account has no activity", () => {
    expect(lastActivityLabel()).toBe(NO_ACTIVITY);
    expect(NO_ACTIVITY).toBe("—");
    expect(overdueBookForAccount(invoices, "cus_quarrypine")[0]?.lastActivity).toBe("—");
  });
});
