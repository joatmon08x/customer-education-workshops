"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function EditableNote({ noteId, body, editable }: { noteId: string; body: string; editable: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(body);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function save() {
    setError(null);
    const response = await fetch(`/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });
    if (!response.ok) {
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      setError(result.error ?? "Note was not updated.");
      return;
    }
    setEditing(false);
    startTransition(() => router.refresh());
  }

  if (!editing) {
    return (
      <div className="space-y-1">
        <p className="text-sm whitespace-pre-wrap">{body}</p>
        {editable ? (
          <Button type="button" variant="link" size="sm" className="h-auto px-0" onClick={() => setEditing(true)}>
            Edit note
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Textarea
        aria-label="Edit note"
        rows={3}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button type="button" size="sm" disabled={pending} onClick={() => void save()}>
          Save
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setDraft(body);
            setEditing(false);
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
