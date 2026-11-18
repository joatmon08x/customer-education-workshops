"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Result = { status: "sent" | "failed"; message: string };

export function NudgeButton({
  invoiceId,
  invoiceNumber,
  label = "Nudge",
  disabled = false,
}: {
  invoiceId?: string;
  invoiceNumber?: string;
  label?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function send() {
    if (!invoiceId) return;
    setPending(true);
    setResult(null);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/nudge`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) {
        setResult({ status: "failed", message: body.error ?? "Nudge could not be sent" });
      } else if (body.activity.status === "failed") {
        setResult({ status: "failed", message: `Nudge failed for ${invoiceNumber}: ${body.nudge.error}` });
      } else {
        setResult({ status: "sent", message: `Nudge sent to ${body.nudge.to} for ${invoiceNumber}` });
      }
      router.refresh();
    } catch {
      setResult({ status: "failed", message: "Nudge could not be sent" });
    } finally {
      setPending(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || pending || !invoiceId}
        onClick={send}
        aria-label={invoiceNumber ? `${label} for ${invoiceNumber}` : label}
      >
        <Send className="size-3.5" />
        {pending ? "Sending…" : label}
      </Button>
      <span role="status" className={cn("text-xs", result?.status === "failed" ? "text-danger" : "text-muted-foreground")}>
        {result?.message}
      </span>
    </span>
  );
}
