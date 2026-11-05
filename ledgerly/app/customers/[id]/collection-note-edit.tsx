"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CollectionNoteEditProps = {
  noteId: string;
  body: string;
};

export function CollectionNoteEdit({ noteId, body }: CollectionNoteEditProps) {
  const router = useRouter();
  const fieldId = `collection-note-edit-${noteId}`;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(body);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Note was not updated.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Note was not updated.");
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edit note
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>Edit collection note</Label>
      <Textarea id={fieldId} value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} />
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => {
            setOpen(false);
            setDraft(body);
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
