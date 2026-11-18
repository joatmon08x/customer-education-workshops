import { NextResponse } from "next/server";
import { canEditNote } from "@/lib/account-notes";
import { prisma } from "@/lib/prisma";

/** Body-only edits inside the window. There is deliberately no DELETE: notes are the audit trail. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let input: { body?: unknown } = {};
  try {
    input = (await request.json()) as typeof input;
  } catch {
    input = {};
  }

  const note = await prisma.collectionNote.findUnique({ where: { id } });
  if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

  if (!canEditNote(note, new Date())) {
    return NextResponse.json(
      { error: "Only Avery Quinn can edit this note, within 15 minutes of saving it" },
      { status: 403 },
    );
  }

  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (!body) return NextResponse.json({ error: "Note body is required" }, { status: 400 });

  const updated = await prisma.collectionNote.update({ where: { id }, data: { body } });
  return NextResponse.json({ note: updated });
}
