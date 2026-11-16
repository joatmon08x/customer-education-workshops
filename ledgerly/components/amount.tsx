import { Lock } from "lucide-react";
import { formatUsd } from "@/lib/money";
import { cn } from "@/lib/utils";

export const MASKED_AMOUNT_LABEL = "Upgrade to view amounts";

export function maskedOrUsd(cents: number, visible: boolean): string {
  return visible ? formatUsd(cents) : MASKED_AMOUNT_LABEL;
}

export function Amount({
  cents,
  visible,
  className,
}: {
  cents: number;
  visible: boolean;
  className?: string;
}) {
  if (visible) {
    return <span className={className}>{formatUsd(cents)}</span>;
  }
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium text-muted-foreground", className)}>
      <Lock className="size-3" aria-hidden="true" />
      {MASKED_AMOUNT_LABEL}
    </span>
  );
}
