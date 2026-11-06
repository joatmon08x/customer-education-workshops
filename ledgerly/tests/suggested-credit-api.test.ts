/**
 * Regression cover for the v2 migration.
 *
 * The client must select the current v2 endpoint. Keep the legacy v1 route
 * available for compatibility.
 */
import { describe, expect, it } from "vitest";
import { suggestedCreditPath } from "@/lib/disputes/suggested-credit-api";

describe("suggested credit API client", () => {
  it("uses the current API version", () => {
    expect(suggestedCreditPath("dsp_1043")).toBe(
      "/api/v2/disputes/dsp_1043/suggested-credit",
    );
  });
});
