import { NextResponse } from "next/server";
import { recordFullPayment } from "@/lib/payments";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 });
  }

  const { method, amountCents } = body as { method?: unknown; amountCents?: unknown };
  const result = await recordFullPayment(id, { method, amountCents });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ payment: result.payment }, { status: 201 });
}
