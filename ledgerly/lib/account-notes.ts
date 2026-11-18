import { DEMO_AS_OF } from "@/lib/clock";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

/** Stand-in for the PRD's unspecified edit window. Measured from createdAt, not occurredOn. */
export const NOTE_EDIT_WINDOW_MS = 15 * 60 * 1000;

export function canEditNote(note: { authorName: string; createdAt: Date }, now: Date) {
  return note.authorName === DEMO_OPERATOR.name && now.getTime() - note.createdAt.getTime() < NOTE_EDIT_WINDOW_MS;
}

/** Wall-clock save time. The feed's date stays on the demo clock; this is the edit-window clock. */
export function formatNoteTime(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(value);
}

export function noteIdFromPayload(payload: string | null): string | null {
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload) as { noteId?: unknown };
    return typeof parsed.noteId === "string" ? parsed.noteId : null;
  } catch {
    return null;
  }
}

export async function getAccountNotes(customerId: string) {
  return prisma.collectionNote.findMany({ where: { customerId }, orderBy: { createdAt: "desc" } });
}

export async function createCollectionNote(input: { customerId: string; body: string; invoiceId?: string | null }) {
  return prisma.$transaction(async (tx) => {
    const note = await tx.collectionNote.create({
      data: {
        customerId: input.customerId,
        invoiceId: input.invoiceId ?? null,
        authorName: DEMO_OPERATOR.name,
        body: input.body,
      },
    });
    await tx.activity.create({
      data: {
        customerId: input.customerId,
        invoiceId: note.invoiceId,
        type: "NOTE_ADDED",
        status: "recorded",
        actorName: DEMO_OPERATOR.name,
        payload: JSON.stringify({ noteId: note.id }),
        occurredOn: DEMO_AS_OF,
      },
    });
    return note;
  });
}
