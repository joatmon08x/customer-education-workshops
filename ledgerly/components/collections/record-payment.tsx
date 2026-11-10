"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PAYMENT_METHOD_LABEL, PAYMENT_METHODS, type PaymentMethod } from "@/lib/collections";
import { formatUsd } from "@/lib/money";

/** Data-entry surface: the amount stays visible here even when the plan masks amounts elsewhere. */
export function RecordPayment({
  invoiceId,
  invoiceNumber,
  outstandingCents,
}: {
  invoiceId: string;
  invoiceNumber: string;
  outstandingCents: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [method, setMethod] = useState<PaymentMethod>("ach");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function commit() {
    setError(null);
    const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, amountCents: outstandingCents }),
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Payment was not recorded.");
      setConfirming(false);
      return;
    }
    setConfirming(false);
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Outstanding</span>
        <span className="font-medium">{formatUsd(outstandingCents)}</span>
      </div>
      {confirming ? (
        <div className="space-y-3 rounded-lg border border-border bg-muted px-3 py-3" role="group" aria-label="Confirm payment">
          <p className="text-sm font-medium">
            Record {formatUsd(outstandingCents)} payment against {invoiceNumber}?
          </p>
          <p className="text-xs text-muted-foreground">Method: {PAYMENT_METHOD_LABEL[method]}</p>
          <div className="flex gap-2">
            <Button type="button" size="sm" disabled={pending} onClick={commit}>
              Confirm payment
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="payment-method">Method</Label>
            <select
              id="payment-method"
              value={method}
              onChange={(event) => setMethod(event.target.value as PaymentMethod)}
              className="h-9 rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              {PAYMENT_METHODS.map((id) => (
                <option key={id} value={id}>
                  {PAYMENT_METHOD_LABEL[id]}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" onClick={() => setConfirming(true)}>
            Record payment
          </Button>
        </div>
      )}
      {error ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
