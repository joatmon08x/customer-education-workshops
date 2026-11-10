"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NoteForm({
  customerId,
  invoices,
}: {
  customerId: string;
  invoices: { id: string; number: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    const response = await fetch(`/api/customers/${customerId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, invoiceId: invoiceId || undefined }),
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Note was not saved.");
      return;
    }
    setBody("");
    setInvoiceId("");
    startTransition(() => router.refresh());
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <Label htmlFor="account-note">Collection note</Label>
      <Textarea
        id="account-note"
        rows={3}
        value={body}
        placeholder="Promise to pay, dispute context, who you spoke with."
        onChange={(event) => setBody(event.target.value)}
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="account-note-invoice">Linked invoice</Label>
          <select
            id="account-note-invoice"
            value={invoiceId}
            onChange={(event) => setInvoiceId(event.target.value)}
            className="h-9 rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            <option value="">Account only</option>
            {invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.number}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={pending || !body.trim()}>
          Save note
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </form>
  );
}
