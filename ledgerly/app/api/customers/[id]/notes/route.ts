import { NextResponse } from "next/server";
import { createCollectionNote } from "@/lib/account-notes";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let input: { body?: unknown; invoiceId?: unknown } = {};
  try {
    input = (await request.json()) as typeof input;
  } catch {
    input = {};
  }

  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (!body) return NextResponse.json({ error: "Note body is required" }, { status: 400 });

  const invoiceId = input.invoiceId == null || input.invoiceId === "" ? null : input.invoiceId;
  if (invoiceId !== null && typeof invoiceId !== "string") {
    return NextResponse.json({ error: "invoiceId must be a string" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { id }, select: { id: true } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  if (invoiceId) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, select: { customerId: true } });
    if (!invoice || invoice.customerId !== customer.id) {
      return NextResponse.json({ error: "Invoice is not on this account" }, { status: 400 });
    }
  }

  const note = await createCollectionNote({ customerId: customer.id, body, invoiceId });
  return NextResponse.json({ note }, { status: 201 });
}
