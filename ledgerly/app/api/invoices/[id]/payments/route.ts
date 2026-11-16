import { NextResponse } from "next/server";
import { DEMO_AS_OF } from "@/lib/clock";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { isPaymentMethod, outstandingCents } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

type PaymentBody = {
  method?: unknown;
  amountCents?: unknown;
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: PaymentBody = {};
  try {
    body = (await request.json()) as PaymentBody;
  } catch {
    body = {};
  }

  if (!isPaymentMethod(body.method)) {
    return NextResponse.json(
      { error: "method must be check, ach, card_on_file, or cash" },
      { status: 400 },
    );
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { payments: true },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const balanceCents = outstandingCents(invoice.totalCents, invoice.payments);
  if (balanceCents === 0) {
    return NextResponse.json({ error: "Outstanding balance is 0" }, { status: 400 });
  }

  if (typeof body.amountCents === "number" && body.amountCents !== balanceCents) {
    return NextResponse.json(
      { error: "amountCents must equal the outstanding balance" },
      { status: 400 },
    );
  }

  const paymentId = `pay_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const activityId = `act_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const method = body.method;

  const [payment, activity, updated] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        id: paymentId,
        invoiceId: invoice.id,
        amountCents: balanceCents,
        method,
        recordedBy: DEMO_OPERATOR.name,
        recordedAt: DEMO_AS_OF,
      },
    }),
    prisma.activity.create({
      data: {
        id: activityId,
        customerId: invoice.customerId,
        invoiceId: invoice.id,
        type: "PAYMENT_RECORDED",
        status: "recorded",
        occurredOn: DEMO_AS_OF,
        amountCents: balanceCents,
        method,
        actorName: DEMO_OPERATOR.name,
      },
    }),
    prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: "PAID",
        paidOn: DEMO_AS_OF,
      },
    }),
  ]);

  return NextResponse.json({
    payment,
    activity,
    invoice: updated,
  });
}
