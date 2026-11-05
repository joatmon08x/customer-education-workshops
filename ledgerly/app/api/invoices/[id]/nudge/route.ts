import { NextResponse } from "next/server";
import { sendInvoiceNudge } from "@/lib/nudge";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await sendInvoiceNudge(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ activity: result.activity });
}
