"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NOTE_EDIT_WINDOW_MS } from "@/lib/collections";

export type ActivityItem = {
  id: string;
  type: "NOTE_ADDED" | "NUDGE_SENT" | "PAYMENT_RECORDED" | string;
  status: string;
  actorName: string;
  channel: string | null;
  recipient: string | null;
  methodLabel: string | null;
  amountLabel: string | null;
  message: string | null;
  timestamp: string;
  createdAt: string;
  invoice: { id: string; number: string } | null;
  note: { id: string; body: string; authorName: string; createdAt: string } | null;
};

const TYPE_LABEL: Record<string, string> = {
  NOTE_ADDED: "Note",
  NUDGE_SENT: "Nudge",
  PAYMENT_RECORDED: "Payment",
};

export function ActivityFeed({ items, operatorName }: { items: ActivityItem[]; operatorName: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No collections activity on this account yet.</p>;
  }
  return (
    <ol className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-lg border border-border px-4 py-3" data-activity-type={item.type}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
              <Badge variant="secondary">{TYPE_LABEL[item.type] ?? item.type}</Badge>
              <span className="font-mono text-xs text-muted-foreground">{item.type}</span>
              {item.type === "NUDGE_SENT" ? (
                <Badge variant={item.status === "failed" ? "danger" : "success"}>
                  {item.status === "failed" ? "Failed" : "Sent"}
                </Badge>
              ) : null}
              {item.invoice ? (
                <Link href={`/invoices/${item.invoice.id}`} className="font-mono text-xs text-indigo hover:underline">
                  {item.invoice.number}
                </Link>
              ) : null}
            </p>
            <p className="text-xs text-muted-foreground">
              {item.actorName} · {item.timestamp}
            </p>
          </div>
          <ActivityBody item={item} operatorName={operatorName} />
        </li>
      ))}
    </ol>
  );
}

function ActivityBody({ item, operatorName }: { item: ActivityItem; operatorName: string }) {
  if (item.type === "NOTE_ADDED" && item.note) {
    return <NoteBody note={item.note} operatorName={operatorName} />;
  }
  if (item.type === "NUDGE_SENT") {
    return (
      <div className="mt-2 space-y-1 text-sm">
        <p className={item.status === "failed" ? "font-medium text-danger" : "text-muted-foreground"}>
          {item.status === "failed"
            ? `Email not delivered — ${item.recipient ? `"${item.recipient}" is not an email address` : "no email on file"}.`
            : `Emailed ${item.recipient}.`}
        </p>
        {item.message ? <p className="text-foreground">{item.message}</p> : null}
      </div>
    );
  }
  if (item.type === "PAYMENT_RECORDED") {
    return (
      <p className="mt-2 text-sm">
        Recorded {item.amountLabel} by {item.methodLabel}.
      </p>
    );
  }
  return null;
}

function NoteBody({
  note,
  operatorName,
}: {
  note: NonNullable<ActivityItem["note"]>;
  operatorName: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.body);
  const [error, setError] = useState<string | null>(null);
  const [openedAt] = useState(() => Date.now());
  const editable =
    note.authorName === operatorName && openedAt - new Date(note.createdAt).getTime() < NOTE_EDIT_WINDOW_MS;

  async function save() {
    setError(null);
    const response = await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Note was not updated.");
      return;
    }
    setEditing(false);
    startTransition(() => router.refresh());
  }

  if (editing) {
    const fieldId = `note-edit-${note.id}`;
    return (
      <div className="mt-2 space-y-2">
        <Label htmlFor={fieldId} className="sr-only">
          Edit note
        </Label>
        <Textarea id={fieldId} rows={3} value={draft} onChange={(event) => setDraft(event.target.value)} />
        <div className="flex gap-2">
          <Button type="button" size="sm" disabled={pending || !draft.trim()} onClick={save}>
            Save edit
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
        {error ? (
          <p role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-start justify-between gap-3">
      <p className="text-sm whitespace-pre-wrap">{note.body}</p>
      {editable ? (
        <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(true)}>
          Edit
        </Button>
      ) : null}
    </div>
  );
}
