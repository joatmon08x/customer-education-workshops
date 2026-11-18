"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type NoteBodyProps = {
  noteId: string;
  body: string;
  editable: boolean;
};

export function NoteBody({ noteId, body, editable }: NoteBodyProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(body);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const response = await fetch(`/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });
    setSaving(false);
    if (!response.ok) {
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      setError(result.error ?? "Edit not saved");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-3">
        <p className="whitespace-pre-wrap text-foreground">{body}</p>
        {editable ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`note-edit-${noteId}`} className="sr-only">
        Edit note
      </Label>
      <Textarea id={`note-edit-${noteId}`} value={draft} onChange={(event) => setDraft(event.target.value)} />
      <div className="flex gap-2">
        <Button type="button" size="sm" disabled={saving} onClick={save}>
          {saving ? "Saving…" : "Save edit"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setDraft(body);
            setEditing(false);
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
