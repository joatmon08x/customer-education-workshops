import { afterEach, describe, expect, it } from "vitest";
import { POST as postNote } from "@/app/api/customers/[id]/notes/route";
import { PATCH as patchNote } from "@/app/api/notes/[id]/route";
import { DEMO_AS_OF } from "@/lib/clock";
import {
  ACTIVITY_STATUS_ADDED,
  ACTIVITY_TYPE_NOTE_ADDED,
  NOTE_EDIT_WINDOW_MS,
} from "@/lib/collection-notes";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

const customerId = "cus_silverpine";
const invoiceId = "inv_1047";
const otherInvoiceId = "inv_1043";

const params = (id: string) => ({ params: Promise.resolve({ id }) });

function noteRequest(body: unknown, id = customerId) {
  return new Request(`http://localhost/api/customers/${id}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function patchRequest(id: string, body: unknown) {
  return new Request(`http://localhost/api/notes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function restoreNotes() {
  await prisma.activity.deleteMany({
    where: { customerId, type: ACTIVITY_TYPE_NOTE_ADDED },
  });
  await prisma.collectionNote.deleteMany({ where: { customerId } });
}

describe("POST /api/customers/[id]/notes", () => {
  afterEach(async () => {
    await restoreNotes();
  });

  it("saves a note first on the account feed as Avery Quinn", async () => {
    await restoreNotes();

    const response = await postNote(noteRequest({ body: "Promise to pay Friday." }), params(customerId));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.note).toMatchObject({
      customerId,
      invoiceId: null,
      authorName: DEMO_OPERATOR.name,
      body: "Promise to pay Friday.",
    });

    const notes = await prisma.collectionNote.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });
    expect(notes).toHaveLength(1);

    const activities = await prisma.activity.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });
    expect(activities[0]).toMatchObject({
      type: ACTIVITY_TYPE_NOTE_ADDED,
      status: ACTIVITY_STATUS_ADDED,
      actorName: DEMO_OPERATOR.name,
      body: "Promise to pay Friday.",
      invoiceId: null,
    });
    expect(activities[0]?.occurredOn.toISOString()).toBe(DEMO_AS_OF.toISOString());
  });

  it("returns 400 for a blank body and leaves the feed unchanged", async () => {
    await restoreNotes();
    const beforeNotes = await prisma.collectionNote.count({ where: { customerId } });
    const beforeActivities = await prisma.activity.count({ where: { customerId } });

    const response = await postNote(noteRequest({ body: "   " }), params(customerId));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Note body is required" });
    expect(await prisma.collectionNote.count({ where: { customerId } })).toBe(beforeNotes);
    expect(await prisma.activity.count({ where: { customerId } })).toBe(beforeActivities);
  });

  it("ties the note to the given invoice", async () => {
    await restoreNotes();

    const response = await postNote(
      noteRequest({ body: "Called about INV-1047.", invoiceId }),
      params(customerId),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.note.invoiceId).toBe(invoiceId);

    const note = await prisma.collectionNote.findFirstOrThrow({ where: { customerId } });
    expect(note.invoiceId).toBe(invoiceId);

    const activity = await prisma.activity.findFirstOrThrow({
      where: { customerId, type: ACTIVITY_TYPE_NOTE_ADDED },
    });
    expect(activity.invoiceId).toBe(invoiceId);

    const rejected = await postNote(
      noteRequest({ body: "Wrong account invoice.", invoiceId: otherInvoiceId }),
      params(customerId),
    );
    expect(rejected.status).toBe(400);
  });
});

describe("PATCH /api/notes/[id]", () => {
  afterEach(async () => {
    await restoreNotes();
  });

  it("saves a new body while Avery Quinn is inside the 15-minute window", async () => {
    await restoreNotes();
    const created = await postNote(noteRequest({ body: "Promise to pay Friday." }), params(customerId));
    const { note } = await created.json();

    const response = await patchNote(
      patchRequest(note.id, { body: "Promise to pay Monday.", authorName: "Morgan Blake" }),
      params(note.id),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.note.body).toBe("Promise to pay Monday.");
    expect(payload.note.authorName).toBe(DEMO_OPERATOR.name);

    const stored = await prisma.collectionNote.findUniqueOrThrow({ where: { id: note.id } });
    expect(stored.body).toBe("Promise to pay Monday.");
    expect(stored.authorName).toBe(DEMO_OPERATOR.name);
  });

  it("returns 403 when the note is older than 15 minutes and leaves the body", async () => {
    await restoreNotes();
    const created = await postNote(noteRequest({ body: "Left a voicemail." }), params(customerId));
    const { note } = await created.json();
    await prisma.collectionNote.update({
      where: { id: note.id },
      data: { createdAt: new Date(Date.now() - NOTE_EDIT_WINDOW_MS - 1_000) },
    });

    const response = await patchNote(patchRequest(note.id, { body: "Changed after the window." }), params(note.id));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Note can no longer be edited" });
    const stored = await prisma.collectionNote.findUniqueOrThrow({ where: { id: note.id } });
    expect(stored.body).toBe("Left a voicemail.");
  });

  it("returns 403 when the author is not Avery Quinn and leaves the body", async () => {
    await restoreNotes();
    const created = await postNote(noteRequest({ body: "Avery's original note." }), params(customerId));
    const { note } = await created.json();
    await prisma.collectionNote.update({
      where: { id: note.id },
      data: { authorName: "Morgan Blake" },
    });

    const response = await patchNote(patchRequest(note.id, { body: "Someone else edited this." }), params(note.id));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Note can no longer be edited" });
    const stored = await prisma.collectionNote.findUniqueOrThrow({ where: { id: note.id } });
    expect(stored.body).toBe("Avery's original note.");
    expect(stored.authorName).toBe("Morgan Blake");
  });
});
