"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NudgeButton({
  invoiceId,
  invoiceNumber,
  label = "Nudge",
  variant = "outline",
}: {
  invoiceId: string | null;
  invoiceNumber?: string;
  label?: string;
  variant?: "default" | "outline";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  async function send() {
    if (!invoiceId) return;
    setResult(null);
    const response = await fetch(`/api/invoices/${invoiceId}/nudge`, { method: "POST" });
    const data = (await response.json()) as {
      error?: string;
      activity?: { status: string; recipient: string | null };
    };
    if (!response.ok || !data.activity) {
      setResult({ ok: false, text: data.error ?? "Nudge could not be logged." });
    } else if (data.activity.status === "failed") {
      setResult({ ok: false, text: "Nudge failed — no valid email on file." });
    } else {
      setResult({ ok: true, text: `Nudge sent to ${data.activity.recipient}.` });
    }
    startTransition(() => router.refresh());
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        variant={variant}
        disabled={!invoiceId || pending}
        onClick={send}
        aria-label={invoiceNumber ? `Send Nudge for ${invoiceNumber}` : undefined}
      >
        <Send className="size-3.5" aria-hidden="true" />
        {label}
      </Button>
      {result ? (
        <span role="status" className={result.ok ? "text-xs text-muted-foreground" : "text-xs font-medium text-danger"}>
          {result.text}
        </span>
      ) : null}
    </span>
  );
}
