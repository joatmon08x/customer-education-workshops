"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type NoteComposerProps = {
  customerId: string;
  invoices: { id: string; number: string }[];
};

export function NoteComposer({ customerId, invoices }: NoteComposerProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const response = await fetch(`/api/customers/${customerId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, invoiceId: invoiceId || null }),
    });
    setSaving(false);
    if (!response.ok) {
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      setError(result.error ?? "Note not saved");
      return;
    }
    setBody("");
    setInvoiceId("");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="account-note">Collection note</Label>
        <Textarea
          id="account-note"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Promise to pay, dispute context, or who to call next."
        />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="account-note-invoice">Invoice</Label>
          <select
            id="account-note-invoice"
            value={invoiceId}
            onChange={(event) => setInvoiceId(event.target.value)}
            className="h-9 rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            <option value="">Whole account</option>
            {invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.number}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save note"}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </form>
  );
}
