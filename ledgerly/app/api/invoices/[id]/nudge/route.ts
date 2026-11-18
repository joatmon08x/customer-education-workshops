import { NextResponse } from "next/server";
import { DEMO_AS_OF } from "@/lib/clock";
import { outstandingCents } from "@/lib/collections";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { NUDGE_CHANNEL, isEmailAddress, nudgeTemplate, type NudgePayload } from "@/lib/nudge";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { customer: true } });
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
  if (invoice.status !== "OVERDUE") {
    return NextResponse.json({ error: "Only OVERDUE invoices can be nudged" }, { status: 400 });
  }

  const template = nudgeTemplate({
    number: invoice.number,
    outstandingCents: outstandingCents(invoice),
    dueOn: invoice.dueOn,
  });
  const email = invoice.customer.email?.trim() || null;
  const deliverable = isEmailAddress(email);
  const payload: NudgePayload = deliverable
    ? { to: email, ...template }
    : { to: email, ...template, error: email ? "Email on file is not an email address" : "No email on file" };

  // An undeliverable Nudge is still logged so the account shows the failed touch.
  const activity = await prisma.activity.create({
    data: {
      customerId: invoice.customerId,
      invoiceId: invoice.id,
      type: "NUDGE_SENT",
      status: deliverable ? "sent" : "failed",
      channel: NUDGE_CHANNEL,
      actorName: DEMO_OPERATOR.name,
      payload: JSON.stringify(payload),
      occurredOn: DEMO_AS_OF,
    },
  });

  return NextResponse.json({ activity, nudge: payload }, { status: 201 });
}
