import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FilterPills } from "@/components/filter-pills";
import { getInvoices } from "@/lib/data";

describe("invoice filter pills", () => {
  it("Overdue pill lists only OVERDUE invoices", async () => {
    const markup = renderToStaticMarkup(
      createElement(FilterPills, {
        pathname: "/invoices",
        value: "ALL",
        items: [
          { id: "ALL", label: "All" },
          { id: "OVERDUE", label: "Overdue" },
        ],
      }),
    );

    const match = markup.match(/href="(\/invoices\?[^"]*OVERDUE[^"]*)"/);
    expect(match?.[1]).toBeDefined();

    const href = match![1]!.replaceAll("&amp;", "&");
    const params = new URL(href, "http://127.0.0.1:43173").searchParams;
    const status = params.get("status") ?? "ALL";

    const invoices = await getInvoices({ status });
    expect(invoices.length).toBeGreaterThan(0);
    expect(invoices.every((invoice) => invoice.status === "OVERDUE")).toBe(true);
  });
});
