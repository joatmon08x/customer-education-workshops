import { afterEach, describe, expect, it } from "vitest";
import { PATCH } from "@/app/api/customers/[id]/route";
import { prisma } from "@/lib/prisma";

const CUSTOMER_ID = "cus_mapleember";
const ORIGINAL_EMAIL = "hello@mapleember.example";

afterEach(async () => {
  await prisma.customer.update({
    where: { id: CUSTOMER_ID },
    data: { email: ORIGINAL_EMAIL },
  });
});

describe("PATCH /api/customers/[id]", () => {
  it("updates the customer email without format validation", async () => {
    const nextEmail = "not-an-email";
    const response = await PATCH(
      new Request(`http://localhost/api/customers/${CUSTOMER_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nextEmail }),
      }),
      { params: Promise.resolve({ id: CUSTOMER_ID }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.customer).toMatchObject({ id: CUSTOMER_ID, email: nextEmail });

    const stored = await prisma.customer.findUnique({ where: { id: CUSTOMER_ID } });
    expect(stored?.email).toBe(nextEmail);
  });
});
