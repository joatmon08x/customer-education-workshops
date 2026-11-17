"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Status-demo plant. An address that ends in .example cannot be emailed.
 * The line still reads "Sent" in muted text. There is no failed treatment.
 */
export function NudgeButton({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  const canEmail = email.includes("@") && !email.endsWith(".example");

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="outline" size="sm" onClick={() => setSent(true)}>
        Nudge
      </Button>
      {sent ? (
        <p className="text-xs text-muted-foreground" data-deliverable={canEmail ? "yes" : "no"}>
          Sent
        </p>
      ) : null}
    </div>
  );
}
