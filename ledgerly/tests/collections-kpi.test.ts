import { afterAll, afterEach, describe, expect, it } from "vitest";
import { DEMO_AS_OF, demoDay } from "@/lib/clock";
import { getDashboard } from "@/lib/data";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

const insertedIds: string[] = [];

async function insertActivity(occurredOn: Date) {
  const row = await prisma.activity.create({
    data: {
      customerId: "cus_quarrypine",
      invoiceId: "inv_1043",
      type: "NOTE_ADDED",
      status: "recorded",
      actorName: DEMO_OPERATOR.name,
      occurredOn,
    },
  });
  insertedIds.push(row.id);
  return row;
}

async function restoreInserted() {
  if (insertedIds.length === 0) return;
  await prisma.activity.deleteMany({ where: { id: { in: [...insertedIds] } } });
  insertedIds.length = 0;
}

describe("collections KPI dashboard load", () => {
  afterEach(async () => {
    await restoreInserted();
  });

  afterAll(async () => {
    await restoreInserted();
    await prisma.$disconnect();
  });

  it("reads activity counts from the Activity table and includes a session insert on the next load", async () => {
    const before = await getDashboard();
    expect(before.kpis.collectionsActivityToday).toBe(0);
    expect(before.kpis.collectionsActivityWeek).toBe(0);

    await insertActivity(DEMO_AS_OF);
    await insertActivity(demoDay("2026-08-20"));
    await insertActivity(demoDay("2026-08-16"));

    const after = await getDashboard();
    expect(after.kpis.collectionsActivityToday).toBe(before.kpis.collectionsActivityToday + 1);
    expect(after.kpis.collectionsActivityWeek).toBe(before.kpis.collectionsActivityWeek + 2);
    expect(after.kpis.collectionsOverdueCount).toBe(before.kpis.collectionsOverdueCount);
    expect(after.kpis.collectionsOverdueCents).toBe(before.kpis.collectionsOverdueCents);
  });
});
