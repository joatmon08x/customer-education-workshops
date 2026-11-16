"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type CollectionNoteEditProps = {
  noteId: string;
  initialBody: string;
};

export function CollectionNoteEdit({ noteId, initialBody }: CollectionNoteEditProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(initialBody);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function saveEdit() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Could not update note.");
        setSubmitting(false);
        return;
      }
      setEditing(false);
      router.refresh();
      setSubmitting(false);
    } catch {
      setError("Could not update note.");
      setSubmitting(false);
    }
  }

  if (!editing) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setBody(initialBody);
          setError(null);
          setEditing(true);
        }}
      >
        Edit
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Textarea rows={3} value={body} onChange={(event) => setBody(event.target.value)} />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={submitting} onClick={() => void saveEdit()}>
          {submitting ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={submitting}
          onClick={() => {
            setEditing(false);
            setError(null);
            setBody(initialBody);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
