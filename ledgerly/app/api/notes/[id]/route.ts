import { NextResponse } from "next/server";
import { canEditCollectionNote, isBlankNoteBody } from "@/lib/collection-notes";
import { prisma } from "@/lib/prisma";

type PatchBody = {
  body?: unknown;
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let payload: PatchBody = {};
  try {
    payload = (await request.json()) as PatchBody;
  } catch {
    payload = {};
  }

  if (isBlankNoteBody(payload.body)) {
    return NextResponse.json({ error: "body must be a non-blank string" }, { status: 400 });
  }

  const body = (payload.body as string).trim();
  const note = await prisma.collectionNote.findUnique({ where: { id } });
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  if (!canEditCollectionNote(note)) {
    return NextResponse.json(
      { error: "Note is not editable by this author within the edit window" },
      { status: 403 },
    );
  }

  const [updated] = await prisma.$transaction([
    prisma.collectionNote.update({
      where: { id },
      data: { body },
    }),
    prisma.activity.updateMany({
      where: { noteId: id, type: "NOTE_ADDED" },
      data: { body },
    }),
  ]);

  return NextResponse.json({ note: updated });
}
