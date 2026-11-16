import { NextResponse } from "next/server";
import { DEMO_AS_OF } from "@/lib/clock";
import { isPaymentMethod, outstandingCents, PAYMENT_METHODS } from "@/lib/collections";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

const PAYABLE_STATUSES = ["OPEN", "OVERDUE"];

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  if (!isPaymentMethod(body.method)) {
    return NextResponse.json(
      { error: `method must be one of ${PAYMENT_METHODS.join(", ")}` },
      { status: 400 },
    );
  }
  const method = body.method;

  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { payments: true } });
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const outstanding = outstandingCents(invoice);
  if (outstanding <= 0 || !PAYABLE_STATUSES.includes(invoice.status)) {
    return NextResponse.json({ error: "Invoice has no outstanding balance" }, { status: 400 });
  }
  // v1 records full payments only; any other amount must not settle the invoice.
  if (body.amountCents !== undefined && body.amountCents !== outstanding) {
    return NextResponse.json(
      { error: "Payment must equal the outstanding balance", outstandingCents: outstanding },
      { status: 400 },
    );
  }

  const [payment] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amountCents: outstanding,
        method,
        recordedBy: DEMO_OPERATOR.name,
        recordedOn: DEMO_AS_OF,
      },
    }),
    prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "PAID", paidOn: DEMO_AS_OF },
    }),
    prisma.activity.create({
      data: {
        customerId: invoice.customerId,
        invoiceId: invoice.id,
        type: "PAYMENT_RECORDED",
        status: "recorded",
        actorName: DEMO_OPERATOR.name,
        method,
        amountCents: outstanding,
        occurredOn: DEMO_AS_OF,
      },
    }),
  ]);

  return NextResponse.json({ payment }, { status: 201 });
}
