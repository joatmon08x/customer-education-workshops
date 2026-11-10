import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FilterPills } from "@/components/filter-pills";

describe("FilterPills", () => {
  it("writes status= in non-ALL pill hrefs, not state=", () => {
    const html = renderToStaticMarkup(
      <FilterPills
        pathname="/invoices"
        value="ALL"
        extra={{ q: "Acme" }}
        items={[
          { id: "ALL", label: "All" },
          { id: "OVERDUE", label: "Overdue" },
        ]}
      />,
    );

    const overdueHref = html.match(/href="([^"]*OVERDUE[^"]*)"/)?.[1] ?? "";
    expect(overdueHref).toContain("status=OVERDUE");
    expect(overdueHref).toContain("q=Acme");
    expect(html).not.toContain("state=");
  });
});
