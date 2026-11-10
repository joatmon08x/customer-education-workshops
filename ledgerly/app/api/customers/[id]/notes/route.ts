import { NextResponse } from "next/server";
import { DEMO_AS_OF } from "@/lib/clock";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Note body is required" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  let invoiceId: string | null = null;
  if (body.invoiceId !== undefined && body.invoiceId !== null && body.invoiceId !== "") {
    const invoice =
      typeof body.invoiceId === "string"
        ? await prisma.invoice.findUnique({ where: { id: body.invoiceId } })
        : null;
    if (!invoice || invoice.customerId !== customer.id) {
      return NextResponse.json({ error: "invoiceId is not on this account" }, { status: 400 });
    }
    invoiceId = invoice.id;
  }

  const note = await prisma.collectionNote.create({
    data: {
      customerId: customer.id,
      invoiceId,
      authorName: DEMO_OPERATOR.name,
      body: text,
      activity: {
        create: {
          customerId: customer.id,
          invoiceId,
          type: "NOTE_ADDED",
          status: "recorded",
          actorName: DEMO_OPERATOR.name,
          occurredOn: DEMO_AS_OF,
        },
      },
    },
    include: { activity: true },
  });

  return NextResponse.json({ note }, { status: 201 });
}
