import { DEMO_OPERATOR } from "@/lib/demo-session";

/** Edit window for collection notes — stand-in for the PRD's unspecified window. */
export const NOTE_EDIT_WINDOW_MS = 15 * 60 * 1000;

export function isBlankNoteBody(body: unknown): boolean {
  return typeof body !== "string" || body.trim().length === 0;
}

export function canEditCollectionNote(note: {
  authorName: string;
  createdAt: Date;
}, now: Date = new Date()): boolean {
  if (note.authorName !== DEMO_OPERATOR.name) return false;
  return now.getTime() - note.createdAt.getTime() < NOTE_EDIT_WINDOW_MS;
}
