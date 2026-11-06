import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runbookSectionHref, runbookTrackHref } from "@/runbooks/meta";

const root = process.cwd();

describe("runbooks catalog hrefs", () => {
  it("points tracks and sections at runbooks.html", () => {
    expect(runbookTrackHref("101")).toBe("runbooks.html?track=101");
    expect(runbookSectionHref("101", "first-prompt")).toBe(
      "runbooks.html?track=101#101-first-prompt",
    );
    expect(runbookTrackHref("201")).toBe("runbooks.html?track=201");
    expect(runbookSectionHref("201", "target-context")).toBe(
      "runbooks.html?track=201#201-target-context",
    );
    expect(runbookTrackHref("301")).toBe("runbooks.html?track=301");
    expect(runbookSectionHref("301", "orchestrate-agents")).toBe(
      "runbooks.html?track=301#301-orchestrate-agents",
    );
    expect(runbookTrackHref("401")).toBe("runbooks.html?track=401");
    expect(runbookSectionHref("401", "what-tasks-do-you-delegate")).toBe(
      "runbooks.html?track=401#401-what-tasks-do-you-delegate",
    );
  });
});

describe("runbooks stay out of the app", () => {
  it("has no runbooks route, API, nav item, or legacy redirect", () => {
    expect(existsSync(join(root, "app/runbooks"))).toBe(false);
    expect(existsSync(join(root, "app/api/runbooks"))).toBe(false);
    expect(existsSync(join(root, "components/runbook-catalog.tsx"))).toBe(false);
    expect(existsSync(join(root, "components/runbook-catalog-select.tsx"))).toBe(false);
    expect(existsSync(join(root, "components/hash-scroll.tsx"))).toBe(false);

    const chrome = readFileSync(join(root, "components/app-chrome.tsx"), "utf8");
    expect(chrome).not.toContain("/runbooks");
    expect(chrome).not.toContain("Runbooks");

    const config = readFileSync(join(root, "next.config.ts"), "utf8");
    expect(config).not.toContain("/runbooks");
    expect(config).not.toContain("redirects");
  });
});
