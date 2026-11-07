import { DEMO_AS_OF } from "@/lib/clock";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const ACTIVITY_TYPE_NOTE_ADDED = "NOTE_ADDED";
export const ACTIVITY_STATUS_ADDED = "added";

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
