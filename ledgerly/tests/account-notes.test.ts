import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as noteRoute from "@/app/api/notes/[id]/route";
import { POST as postNote } from "@/app/api/customers/[id]/notes/route";
import { canEditNote, NOTE_EDIT_WINDOW_MS, noteIdFromPayload } from "@/lib/account-notes";
import { getAccountActivities } from "@/lib/activity";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const json = (method: string, body: unknown) =>
  new Request("http://localhost/api/notes", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

let customerId: string;
let invoiceId: string;
let otherInvoiceId: string;
const createdNoteIds: string[] = [];

async function seedNote(data: { authorName: string; createdAt: Date; body: string }) {
  const note = await prisma.collectionNote.create({ data: { customerId, ...data } });
  createdNoteIds.push(note.id);
  return note;
}

beforeAll(async () => {
  const invoice = await prisma.invoice.findFirstOrThrow({ orderBy: { id: "asc" } });
  customerId = invoice.customerId;
  invoiceId = invoice.id;
  otherInvoiceId = (await prisma.invoice.findFirstOrThrow({ where: { customerId: { not: customerId } } })).id;
});

afterAll(async () => {
  await prisma.activity.deleteMany({
    where: { type: "NOTE_ADDED", OR: createdNoteIds.map((id) => ({ payload: { contains: id } })) },
  });
  await prisma.collectionNote.deleteMany({ where: { id: { in: createdNoteIds } } });
});

describe("POST /api/customers/[id]/notes", () => {
  it("saves the note first in the feed, attributed to Avery Quinn, with a NOTE_ADDED activity", async () => {
    const response = await postNote(json("POST", { body: "  Promised payment Friday.  " }), params(customerId));
    expect(response.status).toBe(201);
    const { note } = await response.json();
    createdNoteIds.push(note.id);

    expect(note).toMatchObject({ authorName: DEMO_OPERATOR.name, body: "Promised payment Friday.", invoiceId: null });
    expect(note.createdAt).toBeTruthy();
    const [first] = await getAccountActivities(customerId);
    expect(first).toMatchObject({ type: "NOTE_ADDED", status: "recorded", actorName: DEMO_OPERATOR.name });
    expect(noteIdFromPayload(first.payload)).toBe(note.id);
  });

  it("rejects a blank body with 400 and leaves the feed unchanged", async () => {
    const before = await prisma.activity.count({ where: { customerId } });
    const response = await postNote(json("POST", { body: "   " }), params(customerId));
    expect(response.status).toBe(400);
    expect(await prisma.activity.count({ where: { customerId } })).toBe(before);
  });

  it("ties the note to the invoice when one is given", async () => {
    const response = await postNote(json("POST", { body: "Disputes the line items.", invoiceId }), params(customerId));
    expect(response.status).toBe(201);
    const { note } = await response.json();
    createdNoteIds.push(note.id);

    expect(note.invoiceId).toBe(invoiceId);
    const activity = await prisma.activity.findFirstOrThrow({ where: { payload: { contains: note.id } } });
    expect(activity.invoiceId).toBe(invoiceId);
  });

  it("rejects an invoice from another account", async () => {
    const response = await postNote(json("POST", { body: "Wrong account.", invoiceId: otherInvoiceId }), params(customerId));
    expect(response.status).toBe(400);
  });
});

describe("PATCH /api/notes/[id]", () => {
  it("saves a new body for Avery's note inside 15 minutes", async () => {
    const note = await seedNote({ authorName: DEMO_OPERATOR.name, createdAt: new Date(), body: "Call back Monday." });
    const response = await noteRoute.PATCH(json("PATCH", { body: "Call back Tuesday." }), params(note.id));
    expect(response.status).toBe(200);
    expect((await prisma.collectionNote.findUniqueOrThrow({ where: { id: note.id } })).body).toBe("Call back Tuesday.");
  });

  it("returns 403 and keeps the body once the note is older than 15 minutes", async () => {
    const note = await seedNote({
      authorName: DEMO_OPERATOR.name,
      createdAt: new Date(Date.now() - NOTE_EDIT_WINDOW_MS - 1000),
      body: "Original body.",
    });
    const response = await noteRoute.PATCH(json("PATCH", { body: "Rewritten." }), params(note.id));
    expect(response.status).toBe(403);
    expect((await prisma.collectionNote.findUniqueOrThrow({ where: { id: note.id } })).body).toBe("Original body.");
  });

  it("returns 403 for a note by another author, even inside the window", async () => {
    const note = await seedNote({ authorName: "Another operator", createdAt: new Date(), body: "Their note." });
    const response = await noteRoute.PATCH(json("PATCH", { body: "Mine now." }), params(note.id));
    expect(response.status).toBe(403);
    expect((await prisma.collectionNote.findUniqueOrThrow({ where: { id: note.id } })).body).toBe("Their note.");
  });

  it("has no delete route", () => {
    expect("DELETE" in noteRoute).toBe(false);
  });

  it("measures the window from createdAt, closing at exactly 15 minutes", () => {
    const createdAt = new Date("2026-11-18T12:00:00.000Z");
    const note = { authorName: DEMO_OPERATOR.name, createdAt };
    expect(canEditNote(note, new Date(createdAt.getTime() + NOTE_EDIT_WINDOW_MS - 1))).toBe(true);
    expect(canEditNote(note, new Date(createdAt.getTime() + NOTE_EDIT_WINDOW_MS))).toBe(false);
  });
});
