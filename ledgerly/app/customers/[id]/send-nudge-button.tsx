"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type SendNudgeButtonProps = {
  invoiceId?: string;
  disabled?: boolean;
  label?: string;
  size?: "default" | "sm";
  "aria-label"?: string;
};

export function SendNudgeButton({
  invoiceId,
  disabled = false,
  label = "Nudge",
  size = "default",
  "aria-label": ariaLabel,
}: SendNudgeButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unavailable = disabled || !invoiceId;

  async function send() {
    if (!invoiceId) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/nudge`, { method: "POST" });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Nudge was not sent.");
        return;
      }
      router.refresh();
    } catch {
      setError("Nudge was not sent.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        size={size}
        variant={size === "sm" ? "outline" : "default"}
        onClick={send}
        disabled={unavailable || pending}
        aria-label={ariaLabel}
      >
        {pending ? "Sending…" : label}
      </Button>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
