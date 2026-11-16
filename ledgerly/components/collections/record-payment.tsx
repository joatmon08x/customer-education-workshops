"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PAYMENT_METHOD_LABEL, PAYMENT_METHODS, type PaymentMethod } from "@/lib/collections";
import { formatUsd } from "@/lib/money";

/** Full payments only: the amount is the outstanding balance and is never typed in. */
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
  const [method, setMethod] = useState<PaymentMethod>("check");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function commit() {
    setError(null);
    const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, amountCents: outstandingCents }),
    });
    if (!response.ok) {
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      setError(result.error ?? "Payment was not recorded.");
      return;
    }
    setConfirming(false);
    startTransition(() => router.refresh());
  }

  if (confirming) {
    return (
      <div className="space-y-3" role="group" aria-label="Confirm payment">
        <p className="text-sm font-medium">
          Record {formatUsd(outstandingCents)} payment against {invoiceNumber}?
        </p>
        <p className="text-xs text-muted-foreground">Method: {PAYMENT_METHOD_LABEL[method]}</p>
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
        <div className="flex gap-2">
          <Button type="button" disabled={pending} onClick={() => void commit()}>
            Confirm payment
          </Button>
          <Button type="button" variant="outline" onClick={() => setConfirming(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="payment-method">Payment method</Label>
        <select
          id="payment-method"
          value={method}
          onChange={(event) => setMethod(event.target.value as PaymentMethod)}
          className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          {PAYMENT_METHODS.map((option) => (
            <option key={option} value={option}>
              {PAYMENT_METHOD_LABEL[option]}
            </option>
          ))}
        </select>
      </div>
      <Button type="button" onClick={() => setConfirming(true)}>
        Record payment
      </Button>
    </div>
  );
}
