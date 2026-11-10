import { NextResponse } from "next/server";
import { DEMO_AS_OF } from "@/lib/clock";
import { isEmailAddress, nudgeMessage, outstandingCents } from "@/lib/collections";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, payments: true },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
  if (invoice.status !== "OVERDUE") {
    return NextResponse.json({ error: "Only overdue invoices can be nudged" }, { status: 400 });
  }

  const recipient = invoice.customer.email?.trim() ?? "";
  // No bounce provider: an address that cannot be emailed is logged as a failed send.
  const status = isEmailAddress(recipient) ? "sent" : "failed";
  const activity = await prisma.activity.create({
    data: {
      customerId: invoice.customerId,
      invoiceId: invoice.id,
      type: "NUDGE_SENT",
      status,
      actorName: DEMO_OPERATOR.name,
      channel: "email",
      recipient: recipient || null,
      message: nudgeMessage({
        number: invoice.number,
        dueOn: invoice.dueOn,
        outstandingCents: outstandingCents(invoice),
      }),
      occurredOn: DEMO_AS_OF,
    },
  });

  return NextResponse.json({ activity }, { status: 201 });
}
