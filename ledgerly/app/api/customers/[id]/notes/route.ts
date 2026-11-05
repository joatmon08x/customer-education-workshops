import { NextResponse } from "next/server";
import { saveCollectionNote } from "@/lib/collection-notes";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let payload: unknown = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const body = payload && typeof payload === "object" && "body" in payload ? payload.body : undefined;
  const invoiceId =
    payload && typeof payload === "object" && "invoiceId" in payload ? payload.invoiceId : undefined;

  const result = await saveCollectionNote(id, { body, invoiceId });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ note: result.note });
}
