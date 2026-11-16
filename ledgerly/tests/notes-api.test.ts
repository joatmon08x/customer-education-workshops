import { afterEach, describe, expect, it } from "vitest";
import { POST as createNote } from "@/app/api/customers/[id]/notes/route";
import { PATCH as patchNote } from "@/app/api/notes/[id]/route";
import { NOTE_EDIT_WINDOW_MS } from "@/lib/collection-notes";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

const CUSTOMER_ID = "cus_quarrypine";
const INVOICE_ID = "inv_1043";
const params = (id: string) => ({ params: Promise.resolve({ id }) });

async function clearNotes() {
  await prisma.activity.deleteMany({
    where: { customerId: CUSTOMER_ID, type: "NOTE_ADDED" },
  });
  await prisma.collectionNote.deleteMany({ where: { customerId: CUSTOMER_ID } });
}

afterEach(async () => {
  await clearNotes();
});

describe("POST /api/customers/[id]/notes", () => {
  it("persists a CollectionNote and NOTE_ADDED activity for Avery Quinn", async () => {
    await clearNotes();

    const response = await createNote(
      new Request(`http://localhost/api/customers/${CUSTOMER_ID}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "Promised ACH by Friday." }),
      }),
      params(CUSTOMER_ID),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.note).toMatchObject({
      customerId: CUSTOMER_ID,
      invoiceId: null,
      authorName: DEMO_OPERATOR.name,
      body: "Promised ACH by Friday.",
    });
    expect(payload.activity).toMatchObject({
      customerId: CUSTOMER_ID,
      invoiceId: null,
      noteId: payload.note.id,
      type: "NOTE_ADDED",
      status: "recorded",
      body: "Promised ACH by Friday.",
      actorName: DEMO_OPERATOR.name,
    });

    const notes = await prisma.collectionNote.findMany({
      where: { customerId: CUSTOMER_ID },
      orderBy: { createdAt: "desc" },
    });
    expect(notes).toHaveLength(1);
    expect(notes[0].id).toBe(payload.note.id);

    const activities = await prisma.activity.findMany({
      where: { customerId: CUSTOMER_ID, type: "NOTE_ADDED" },
      orderBy: { createdAt: "desc" },
    });
    expect(activities).toHaveLength(1);
    expect(activities[0].noteId).toBe(payload.note.id);
  });

  it("returns 400 for a blank body and leaves the feed unchanged", async () => {
    await clearNotes();
    const before = await prisma.activity.count({
      where: { customerId: CUSTOMER_ID, type: "NOTE_ADDED" },
    });

    const response = await createNote(
      new Request(`http://localhost/api/customers/${CUSTOMER_ID}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "   " }),
      }),
      params(CUSTOMER_ID),
    );

    expect(response.status).toBe(400);
    const afterNotes = await prisma.collectionNote.count({ where: { customerId: CUSTOMER_ID } });
    const afterActivities = await prisma.activity.count({
      where: { customerId: CUSTOMER_ID, type: "NOTE_ADDED" },
    });
    expect(afterNotes).toBe(0);
    expect(afterActivities).toBe(before);
  });

  it("ties the note to an invoice when invoiceId is provided", async () => {
    await clearNotes();

    const response = await createNote(
      new Request(`http://localhost/api/customers/${CUSTOMER_ID}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: "Customer disputed the Scale line on INV-1043.",
          invoiceId: INVOICE_ID,
        }),
      }),
      params(CUSTOMER_ID),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.note.invoiceId).toBe(INVOICE_ID);
    expect(payload.activity.invoiceId).toBe(INVOICE_ID);
  });

  it("lists the newest note first by createdAt", async () => {
    await clearNotes();
    const olderAt = new Date(Date.now() - 60_000);
    const newerAt = new Date();

    await prisma.collectionNote.create({
      data: {
        id: "note_older_test",
        customerId: CUSTOMER_ID,
        authorName: DEMO_OPERATOR.name,
        body: "Older note",
        createdAt: olderAt,
        updatedAt: olderAt,
      },
    });
    await prisma.collectionNote.create({
      data: {
        id: "note_newer_test",
        customerId: CUSTOMER_ID,
        authorName: DEMO_OPERATOR.name,
        body: "Newer note",
        createdAt: newerAt,
        updatedAt: newerAt,
      },
    });

    const notes = await prisma.collectionNote.findMany({
      where: { customerId: CUSTOMER_ID },
      orderBy: { createdAt: "desc" },
    });
    expect(notes.map((note) => note.id)).toEqual(["note_newer_test", "note_older_test"]);
  });
});

describe("PATCH /api/notes/[id]", () => {
  it("updates the body when Avery Quinn edits within 15 minutes", async () => {
    await clearNotes();
    const createdAt = new Date();
    await prisma.collectionNote.create({
      data: {
        id: "note_editable_test",
        customerId: CUSTOMER_ID,
        authorName: DEMO_OPERATOR.name,
        body: "Original wording",
        createdAt,
        updatedAt: createdAt,
      },
    });
    await prisma.activity.create({
      data: {
        id: "act_note_editable_test",
        customerId: CUSTOMER_ID,
        noteId: "note_editable_test",
        type: "NOTE_ADDED",
        status: "recorded",
        occurredOn: createdAt,
        body: "Original wording",
        actorName: DEMO_OPERATOR.name,
        createdAt,
      },
    });

    const response = await patchNote(
      new Request("http://localhost/api/notes/note_editable_test", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "Corrected wording" }),
      }),
      params("note_editable_test"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.note.body).toBe("Corrected wording");

    const stored = await prisma.collectionNote.findUniqueOrThrow({
      where: { id: "note_editable_test" },
    });
    expect(stored.body).toBe("Corrected wording");
    const activity = await prisma.activity.findUniqueOrThrow({
      where: { id: "act_note_editable_test" },
    });
    expect(activity.body).toBe("Corrected wording");
  });

  it("returns 403 when the note is older than 15 minutes", async () => {
    await clearNotes();
    const createdAt = new Date(Date.now() - NOTE_EDIT_WINDOW_MS - 1_000);
    await prisma.collectionNote.create({
      data: {
        id: "note_stale_test",
        customerId: CUSTOMER_ID,
        authorName: DEMO_OPERATOR.name,
        body: "Locked wording",
        createdAt,
        updatedAt: createdAt,
      },
    });

    const response = await patchNote(
      new Request("http://localhost/api/notes/note_stale_test", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "Should not save" }),
      }),
      params("note_stale_test"),
    );

    expect(response.status).toBe(403);
    const stored = await prisma.collectionNote.findUniqueOrThrow({
      where: { id: "note_stale_test" },
    });
    expect(stored.body).toBe("Locked wording");
  });

  it("returns 403 when the author is not Avery Quinn", async () => {
    await clearNotes();
    const createdAt = new Date();
    await prisma.collectionNote.create({
      data: {
        id: "note_other_author_test",
        customerId: CUSTOMER_ID,
        authorName: "Other Operator",
        body: "Someone else wrote this",
        createdAt,
        updatedAt: createdAt,
      },
    });

    const response = await patchNote(
      new Request("http://localhost/api/notes/note_other_author_test", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "Should not save" }),
      }),
      params("note_other_author_test"),
    );

    expect(response.status).toBe(403);
    const stored = await prisma.collectionNote.findUniqueOrThrow({
      where: { id: "note_other_author_test" },
    });
    expect(stored.body).toBe("Someone else wrote this");
  });
});
