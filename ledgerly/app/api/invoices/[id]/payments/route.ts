import { NextResponse } from "next/server";
import { isPaymentMethod, readPostedAmountCents, recordFullPayment } from "@/lib/payments";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const method = body && typeof body === "object" && "method" in body ? body.method : undefined;
  if (!isPaymentMethod(method)) {
    return NextResponse.json(
      { error: "method must be check, ach, card_on_file, or cash" },
      { status: 400 },
    );
  }

  const posted = readPostedAmountCents(body);
  if (!posted.ok) {
    return NextResponse.json({ error: posted.error }, { status: 400 });
  }

  const result = await recordFullPayment(id, method, posted.amountCents);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ payment: result.payment });
}
