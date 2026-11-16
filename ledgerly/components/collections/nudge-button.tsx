"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export function NudgeButton({
  invoiceId,
  label = "Nudge",
  size = "sm",
  variant = "outline",
}: {
  invoiceId: string | null;
  label?: string;
  size?: "sm" | "default";
  variant?: "outline" | "default";
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function send() {
    if (!invoiceId) return;
    setError(null);
    const response = await fetch(`/api/invoices/${invoiceId}/nudge`, { method: "POST" });
    if (!response.ok) {
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      setError(result.error ?? "Nudge was not sent.");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button
        type="button"
        size={size}
        variant={variant}
        disabled={!invoiceId || pending}
        onClick={() => void send()}
      >
        <Send aria-hidden="true" />
        {label}
      </Button>
      {error ? (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      ) : null}
    </span>
  );
}
