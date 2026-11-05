"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABEL,
  recordPaymentConfirmCopy,
  type PaymentMethod,
} from "@/lib/payments";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none",
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40",
);

type RecordPaymentFormProps = {
  invoiceId: string;
  invoiceNumber: string;
  amountCents: number;
};

export function RecordPaymentForm({ invoiceId, invoiceNumber, amountCents }: RecordPaymentFormProps) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("check");
  const [step, setStep] = useState<"choose" | "confirm">("choose");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmCopy = recordPaymentConfirmCopy(amountCents, invoiceNumber);

  async function submit() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, amountCents }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Payment was not recorded.");
        return;
      }
      setStep("choose");
      router.refresh();
    } catch {
      setError("Payment was not recorded.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      {step === "choose" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="payment-method">Method</Label>
            <select
              id="payment-method"
              className={selectClassName}
              value={method}
              onChange={(event) => setMethod(event.target.value as PaymentMethod)}
            >
              {PAYMENT_METHODS.map((option) => (
                <option key={option} value={option}>
                  {PAYMENT_METHOD_LABEL[option]}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" onClick={() => setStep("confirm")}>
            Record payment
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm">{confirmCopy}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={submit} disabled={pending}>
              {pending ? "Recording…" : "Confirm"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setStep("choose")} disabled={pending}>
              Back
            </Button>
          </div>
        </>
      )}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
