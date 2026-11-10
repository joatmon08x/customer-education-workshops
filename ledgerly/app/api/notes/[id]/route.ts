import { NextResponse } from "next/server";
import { canEditNote } from "@/lib/collections";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

// Notes are an audit trail: PATCH only, no DELETE.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const note = await prisma.collectionNote.findUnique({ where: { id } });
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }
  if (!canEditNote(note, DEMO_OPERATOR.name)) {
    return NextResponse.json(
      { error: "Notes are editable by their author for 15 minutes after creation" },
      { status: 403 },
    );
  }

  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Note body is required" }, { status: 400 });
  }

  const updated = await prisma.collectionNote.update({ where: { id }, data: { body: text } });
  return NextResponse.json({ note: updated });
}
