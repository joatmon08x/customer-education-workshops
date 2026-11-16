import { describe, expect, it } from "vitest";
import {
  isPaymentMethod,
  outstandingCents,
  paymentMethodLabel,
  PAYMENT_METHODS,
} from "@/lib/payments";

describe("payments helpers", () => {
  it("accepts only the catalog payment methods", () => {
    expect(PAYMENT_METHODS).toEqual(["check", "ach", "card_on_file", "cash"]);
    expect(isPaymentMethod("ach")).toBe(true);
    expect(isPaymentMethod("wire")).toBe(false);
    expect(paymentMethodLabel("card_on_file")).toBe("Card on file");
  });

  it("computes outstanding as total minus recorded payments", () => {
    expect(outstandingCents(24900, [])).toBe(24900);
    expect(outstandingCents(24900, [{ amountCents: 24900 }])).toBe(0);
    expect(outstandingCents(9900, [{ amountCents: 4900 }, { amountCents: 5000 }])).toBe(0);
  });
});
