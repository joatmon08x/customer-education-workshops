import { DEMO_AS_OF } from "@/lib/clock";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const ACTIVITY_TYPE_NOTE_ADDED = "NOTE_ADDED";
export const ACTIVITY_STATUS_ADDED = "added";
export const NOTE_EDIT_WINDOW_MS = 15 * 60 * 1000;

export function isCollectionNoteEditable(
  note: { authorName: string; createdAt: Date },
  now = new Date(),
) {
  return (
    note.authorName === DEMO_OPERATOR.name &&
    now.getTime() - note.createdAt.getTime() < NOTE_EDIT_WINDOW_MS
  );
}

export function matchNotesToActivities<
  A extends { type: string; actorName: string; createdAt: Date },
  N extends { authorName: string; createdAt: Date },
>(activities: A[], notes: N[]) {
  const unused = [...notes];
  return activities.map((activity) => {
    if (activity.type !== ACTIVITY_TYPE_NOTE_ADDED) {
      return { activity, note: undefined };
    }

    let bestIndex = -1;
    let bestDelta = Infinity;
    unused.forEach((entry, index) => {
      if (entry.authorName !== activity.actorName) return;
      const delta = Math.abs(entry.createdAt.getTime() - activity.createdAt.getTime());
      if (delta < bestDelta) {
        bestDelta = delta;
        bestIndex = index;
      }
    });

    if (bestIndex < 0 || bestDelta >= 5_000) {
      return { activity, note: undefined };
    }

    const [note] = unused.splice(bestIndex, 1);
    return { activity, note };
  });
}

export async function saveCollectionNote(
  customerId: string,
  input: { body: unknown; invoiceId?: unknown },
) {
  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (!body) {
    return { ok: false as const, status: 400 as const, error: "Note body is required" };
  }

  const invoiceId =
    typeof input.invoiceId === "string" && input.invoiceId.trim() ? input.invoiceId.trim() : null;

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return { ok: false as const, status: 404 as const, error: "Customer not found" };
  }

  if (invoiceId) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice || invoice.customerId !== customerId) {
      return { ok: false as const, status: 400 as const, error: "Invoice is not on this account" };
    }
  }

  const noteId = `nte_${crypto.randomUUID()}`;
  const activityId = `act_${crypto.randomUUID()}`;

  const note = await prisma.$transaction(async (tx) => {
    const created = await tx.collectionNote.create({
      data: {
        id: noteId,
        customerId,
        invoiceId,
        authorName: DEMO_OPERATOR.name,
        body,
      },
    });
    await tx.activity.create({
      data: {
        id: activityId,
        customerId,
        invoiceId,
        type: ACTIVITY_TYPE_NOTE_ADDED,
        status: ACTIVITY_STATUS_ADDED,
        occurredOn: DEMO_AS_OF,
        actorName: DEMO_OPERATOR.name,
        body,
      },
    });
    return created;
  });

  return { ok: true as const, note };
}

export async function updateCollectionNote(id: string, input: { body: unknown }) {
  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (!body) {
    return { ok: false as const, status: 400 as const, error: "Note body is required" };
  }

  const note = await prisma.collectionNote.findUnique({ where: { id } });
  if (!note) {
    return { ok: false as const, status: 404 as const, error: "Note not found" };
  }

  if (!isCollectionNoteEditable(note)) {
    return { ok: false as const, status: 403 as const, error: "Note can no longer be edited" };
  }

  const updated = await prisma.collectionNote.update({
    where: { id },
    data: { body },
  });

  return { ok: true as const, note: updated };
}
