"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatUsd } from "@/lib/money";
import { PAYMENT_METHODS, paymentMethodLabel, type PaymentMethod } from "@/lib/payment-methods";

type RecordPaymentProps = {
  invoiceId: string;
  invoiceNumber: string;
  outstandingCents: number;
};

/** The only amount offered is the full outstanding balance; there is no amount field. */
export function RecordPayment({ invoiceId, invoiceNumber, outstandingCents }: RecordPaymentProps) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("check");
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const amount = formatUsd(outstandingCents);

  async function confirm() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method }),
    }).catch(() => null);
    setPending(false);
    if (!response?.ok) {
      const body = (await response?.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Payment was not recorded.");
      return;
    }
    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="space-y-3" role="group" aria-label="Confirm payment">
        <p className="text-sm font-medium">
          Record {amount} payment against {invoiceNumber}?
        </p>
        <p className="text-sm text-muted-foreground">Method: {paymentMethodLabel(method)}</p>
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={confirm} disabled={pending}>
            {pending ? "Recording…" : `Record ${amount}`}
          </Button>
          <Button type="button" variant="outline" onClick={() => setConfirming(false)} disabled={pending}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="payment-method">Method</Label>
        <select
          id="payment-method"
          value={method}
          onChange={(event) => setMethod(event.target.value as PaymentMethod)}
          className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          {PAYMENT_METHODS.map((option) => (
            <option key={option} value={option}>
              {paymentMethodLabel(option)}
            </option>
          ))}
        </select>
      </div>
      <p className="text-sm text-muted-foreground">Full outstanding balance: {amount}</p>
      <Button type="button" onClick={() => setConfirming(true)}>
        Record payment
      </Button>
    </div>
  );
}
