import { afterEach, describe, expect, it } from "vitest";
import { POST as postNudge } from "@/app/api/invoices/[id]/nudge/route";
import { DEMO_AS_OF, demoDay } from "@/lib/clock";
import { accountNudgeTarget, isEmailAddress, nudgeTemplate, parseNudgePayload } from "@/lib/nudge";
import { PLAN_PRICE_CENTS } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

const request = new Request("http://localhost/api/invoices/nudge", { method: "POST" });
const params = (id: string) => ({ params: Promise.resolve({ id }) });

const createdActivityIds: string[] = [];
const restoreEmails = new Map<string, string>();

afterEach(async () => {
  await prisma.activity.deleteMany({ where: { id: { in: createdActivityIds.splice(0) } } });
  for (const [id, email] of restoreEmails) {
    await prisma.customer.update({ where: { id }, data: { email } });
  }
  restoreEmails.clear();
});

async function withEmail(customerId: string, email: string) {
  const customer = await prisma.customer.findUniqueOrThrow({ where: { id: customerId } });
  restoreEmails.set(customerId, customer.email);
  await prisma.customer.update({ where: { id: customerId }, data: { email } });
}

describe("nudge helpers", () => {
  it("fills the fixed template with invoice number, outstanding balance, and due date", () => {
    const { subject, body } = nudgeTemplate({
      number: "INV-1043",
      outstandingCents: PLAN_PRICE_CENTS.SCALE,
      dueOn: demoDay("2026-08-09"),
    });
    expect(subject).toContain("INV-1043");
    expect(body).toContain("INV-1043");
    expect(body).toContain("$249.00");
    expect(body).toContain("Aug 9, 2026");
  });

  it("only treats a real-looking address as deliverable", () => {
    expect(isEmailAddress("accounts@cobaltgoods.example")).toBe(true);
    expect(isEmailAddress("")).toBe(false);
    expect(isEmailAddress(null)).toBe(false);
    expect(isEmailAddress("cobalt goods billing")).toBe(false);
  });

  it("targets the most-past-due OVERDUE invoice for the account Nudge, or nothing", () => {
    const invoice = (id: string, status: string, dueOn: string) => ({
      id,
      status,
      dueOn: demoDay(dueOn),
      totalCents: PLAN_PRICE_CENTS.GROWTH,
    });
    expect(
      accountNudgeTarget(
        [invoice("inv_a", "OVERDUE", "2026-08-12"), invoice("inv_b", "OVERDUE", "2026-08-04"), invoice("inv_c", "OPEN", "2026-07-01")],
        DEMO_AS_OF,
      )?.id,
    ).toBe("inv_b");
    expect(accountNudgeTarget([invoice("inv_c", "OPEN", "2026-09-06")], DEMO_AS_OF)).toBeNull();
  });
});

describe("POST /api/invoices/[id]/nudge", () => {
  it("logs a sent email Nudge from Avery Quinn on the account feed", async () => {
    const response = await postNudge(request, params("inv_1043"));
    const body = await response.json();
    createdActivityIds.push(body.activity.id);

    expect(response.status).toBe(201);
    const activity = await prisma.activity.findUniqueOrThrow({ where: { id: body.activity.id } });
    expect(activity).toMatchObject({
      customerId: "cus_quarrypine",
      invoiceId: "inv_1043",
      type: "NUDGE_SENT",
      status: "sent",
      channel: "email",
      actorName: "Avery Quinn",
      occurredOn: DEMO_AS_OF,
    });
    const payload = parseNudgePayload(activity.payload);
    expect(payload?.to).toBe("accounts@cobaltgoods.example");
    expect(payload?.body).toContain("INV-1043");
    expect(payload?.body).toContain("$249.00");
    expect(payload?.error).toBeUndefined();
  });

  it.each(["", "not-an-email"])("logs a failed Nudge when the email on file is %j", async (email) => {
    await withEmail("cus_quarrypine", email);
    const response = await postNudge(request, params("inv_1043"));
    const body = await response.json();
    createdActivityIds.push(body.activity.id);

    expect(response.status).toBe(201);
    const activity = await prisma.activity.findUniqueOrThrow({ where: { id: body.activity.id } });
    expect(activity).toMatchObject({ type: "NUDGE_SENT", status: "failed", channel: "email" });
    expect(parseNudgePayload(activity.payload)?.error).toBeTruthy();
  });

  it("rejects an invoice that is not OVERDUE and stores nothing", async () => {
    const before = await prisma.activity.count({ where: { invoiceId: "inv_1041", type: "NUDGE_SENT" } });
    const response = await postNudge(request, params("inv_1041"));

    expect(response.status).toBe(400);
    expect(await prisma.activity.count({ where: { invoiceId: "inv_1041", type: "NUDGE_SENT" } })).toBe(before);
  });

  it("returns 404 for a missing invoice", async () => {
    const response = await postNudge(request, params("inv_missing"));
    expect(response.status).toBe(404);
  });
});
