"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none",
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40",
);

type CollectionNoteFormProps = {
  customerId: string;
  invoices: { id: string; number: string }[];
};

export function CollectionNoteForm({ customerId, invoices }: CollectionNoteFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setPending(true);
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
        setError(payload?.error ?? "Note was not saved.");
        return;
      }
      setBody("");
      setInvoiceId("");
      router.refresh();
    } catch {
      setError("Note was not saved.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="collection-note-body">Collection note</Label>
        <Textarea
          id="collection-note-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
        />
      </div>
      {invoices.length > 0 ? (
        <div className="space-y-2">
          <Label htmlFor="collection-note-invoice">Invoice (optional)</Label>
          <select
            id="collection-note-invoice"
            className={selectClassName}
            value={invoiceId}
            onChange={(event) => setInvoiceId(event.target.value)}
          >
            <option value="">Account</option>
            {invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.number}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <Button type="button" onClick={submit} disabled={pending}>
        {pending ? "Saving…" : "Save note"}
      </Button>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
