"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatUsd } from "@/lib/money";
import {
  PAYMENT_METHODS,
  paymentMethodLabel,
  type PaymentMethod,
} from "@/lib/payments";

type RecordPaymentFormProps = {
  invoiceId: string;
  invoiceNumber: string;
  outstandingCents: number;
};

export function RecordPaymentForm({
  invoiceId,
  invoiceNumber,
  outstandingCents,
}: RecordPaymentFormProps) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("check");
  const [step, setStep] = useState<"method" | "confirm">("method");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (outstandingCents <= 0) {
    return (
      <p className="text-sm text-muted-foreground">No outstanding balance to record.</p>
    );
  }

  async function commitPayment() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Could not record payment.");
        setSubmitting(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Could not record payment.");
      setSubmitting(false);
    }
  }

  if (step === "confirm") {
    return (
      <div className="space-y-3">
        <p className="text-sm">
          Record {formatUsd(outstandingCents)} payment against {invoiceNumber}?
        </p>
        <p className="text-xs text-muted-foreground">
          Method: {paymentMethodLabel(method)}. Amount is the full outstanding balance.
        </p>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={submitting} onClick={() => void commitPayment()}>
            {submitting ? "Recording…" : "Confirm payment"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => {
              setStep("method");
              setError(null);
            }}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="payment-method">Payment method</Label>
        <select
          id="payment-method"
          className="flex h-9 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          value={method}
          onChange={(event) => setMethod(event.target.value as PaymentMethod)}
        >
          {PAYMENT_METHODS.map((value) => (
            <option key={value} value={value}>
              {paymentMethodLabel(value)}
            </option>
          ))}
        </select>
      </div>
      <p className="text-sm text-muted-foreground">
        Outstanding: {formatUsd(outstandingCents)}. The confirm step uses this amount only.
      </p>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="button" onClick={() => setStep("confirm")}>
        Continue
      </Button>
    </div>
  );
}
