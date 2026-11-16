import { NextResponse } from "next/server";
import { isBlankNoteBody } from "@/lib/collection-notes";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

type NoteBody = {
  body?: unknown;
  invoiceId?: unknown;
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: customerId } = await params;

  let payload: NoteBody = {};
  try {
    payload = (await request.json()) as NoteBody;
  } catch {
    payload = {};
  }

  if (isBlankNoteBody(payload.body)) {
    return NextResponse.json({ error: "body must be a non-blank string" }, { status: 400 });
  }

  const body = (payload.body as string).trim();
  const invoiceId =
    typeof payload.invoiceId === "string" && payload.invoiceId.length > 0
      ? payload.invoiceId
      : null;

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  if (invoiceId) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, customerId },
    });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found on this account" }, { status: 400 });
    }
  }

  const noteId = `note_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const activityId = `act_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const now = new Date();

  const [note, activity] = await prisma.$transaction([
    prisma.collectionNote.create({
      data: {
        id: noteId,
        customerId,
        invoiceId,
        authorName: DEMO_OPERATOR.name,
        body,
        createdAt: now,
        updatedAt: now,
      },
    }),
    prisma.activity.create({
      data: {
        id: activityId,
        customerId,
        invoiceId,
        noteId,
        type: "NOTE_ADDED",
        status: "recorded",
        occurredOn: now,
        body,
        actorName: DEMO_OPERATOR.name,
        createdAt: now,
      },
    }),
  ]);

  return NextResponse.json({ note, activity });
}
