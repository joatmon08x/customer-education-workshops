"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CollectionNoteFormProps = {
  customerId: string;
  invoices: { id: string; number: string }[];
};

export function CollectionNoteForm({ customerId, invoices }: CollectionNoteFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function saveNote() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/customers/${customerId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          ...(invoiceId ? { invoiceId } : {}),
        }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Could not save note.");
        setSubmitting(false);
        return;
      }
      setBody("");
      setInvoiceId("");
      router.refresh();
      setSubmitting(false);
    } catch {
      setError("Could not save note.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3 px-5 pb-2">
      <div className="space-y-2">
        <Label htmlFor="account-collection-note">Collection note</Label>
        <Textarea
          id="account-collection-note"
          rows={3}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Promise-to-pay, dispute context, or outreach detail"
        />
      </div>
      {invoices.length > 0 ? (
        <div className="space-y-2">
          <Label htmlFor="note-invoice">Linked invoice (optional)</Label>
          <select
            id="note-invoice"
            className="flex h-9 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            value={invoiceId}
            onChange={(event) => setInvoiceId(event.target.value)}
          >
            <option value="">None</option>
            {invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.number}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="button" disabled={submitting} onClick={() => void saveNote()}>
        {submitting ? "Saving…" : "Save note"}
      </Button>
    </div>
  );
}
