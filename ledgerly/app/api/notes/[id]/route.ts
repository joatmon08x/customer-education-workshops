import { NextResponse } from "next/server";
import { updateCollectionNote } from "@/lib/collection-notes";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let payload: unknown = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const body = payload && typeof payload === "object" && "body" in payload ? payload.body : undefined;
  const result = await updateCollectionNote(id, { body });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ note: result.note });
}
