import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DONE_ON_SHEET_TITLE,
  EPICS_CSV_HEADER,
  EPICS_CSV_PATH,
  OMITTED_SHEET_TITLE,
  TODO_ON_SHEET_TITLE,
  epicSheetRows,
  renderEpicsCsv,
  sheetStatus,
} from "@/scripts/generate-epics-csv";
import { STATUS_DECK_SLIDES, buildStatusPptx } from "@/scripts/generate-status-pptx";
import {
  CATALOG_STAGE_TITLES,
  STATUS_BOARD_ISSUES,
  WCAG_CONTRAST_TEST,
  linearPriority,
  statusBoardNewIssues,
} from "@/runbooks/linear-field-demos";

const root = process.cwd();
const banned = /\b(leverage|seamless|robust|very|deep dive)\b|—|–/i;

describe("status demo board", () => {
  it("keeps every catalog title on the board and adds the new rows beside them", () => {
    expect(CATALOG_STAGE_TITLES).toHaveLength(14);
    expect(STATUS_BOARD_ISSUES.length).toBeGreaterThanOrEqual(25);
    expect(STATUS_BOARD_ISSUES.length).toBeLessThanOrEqual(40);
    for (const title of CATALOG_STAGE_TITLES) {
      expect(STATUS_BOARD_ISSUES.filter((issue) => issue.title === title)).toHaveLength(1);
    }
    expect(statusBoardNewIssues()).toHaveLength(STATUS_BOARD_ISSUES.length - CATALOG_STAGE_TITLES.length);
    expect(new Set(STATUS_BOARD_ISSUES.map((issue) => issue.title)).size).toBe(STATUS_BOARD_ISSUES.length);
    expect(new Set(STATUS_BOARD_ISSUES.map((issue) => issue.sheetId)).size).toBe(STATUS_BOARD_ISSUES.length);
    const epics = new Set(STATUS_BOARD_ISSUES.map((issue) => issue.epic));
    expect(epics.size).toBeGreaterThanOrEqual(4);
    expect(epics.size).toBeLessThanOrEqual(6);
  });

  it("records the three board states the sheet is checked against", () => {
    const nudge = STATUS_BOARD_ISSUES.find(
      (issue) => issue.title === "A Nudge that cannot be emailed shows as failed",
    );
    const dashboard = STATUS_BOARD_ISSUES.find((issue) => issue.title === DONE_ON_SHEET_TITLE);
    const contrast = STATUS_BOARD_ISSUES.find((issue) => issue.title === TODO_ON_SHEET_TITLE);
    expect(nudge?.state).toBe("In Progress");
    expect(dashboard?.state).toBe("In Progress");
    expect(dashboard?.title).toBe("Dashboard shows collections totals on the next load");
    expect(contrast?.state).toBe("At risk");
    expect(contrast?.priority).toBe("High");
    expect(contrast?.title).toBe(WCAG_CONTRAST_TEST.title);
    expect(linearPriority("High")).toBe(2);
    expect(linearPriority("Medium")).toBe(3);
    expect(linearPriority("Low")).toBe(4);
    expect(linearPriority("Urgent")).toBe(1);
  });
});

describe("epics spreadsheet gaps", () => {
  const rows = epicSheetRows();

  it("documents the three gaps in the generator and applies only those", () => {
    const source = readFileSync(join(root, "scripts/generate-epics-csv.ts"), "utf8");
    expect(source).toContain("Deliberate spreadsheet gaps");
    expect(OMITTED_SHEET_TITLE).toBe("Invoice detail has no control to change customer email");
    expect(DONE_ON_SHEET_TITLE).toBe("Dashboard shows collections totals on the next load");
    expect(TODO_ON_SHEET_TITLE).toBe(
      "Accessibility contrast tests fail 4.5:1 on badges, muted text, and the up KPI",
    );
    expect(source).toContain(OMITTED_SHEET_TITLE);
    expect(source).toContain(DONE_ON_SHEET_TITLE);
    expect(source).toContain(TODO_ON_SHEET_TITLE);

    expect(rows.some((row) => row.title === OMITTED_SHEET_TITLE)).toBe(false);
    const dashboard = rows.find((row) => row.title === DONE_ON_SHEET_TITLE);
    const contrast = rows.find((row) => row.title === TODO_ON_SHEET_TITLE);
    expect(dashboard?.status).toBe("Done");
    expect(sheetStatus(STATUS_BOARD_ISSUES.find((issue) => issue.title === DONE_ON_SHEET_TITLE)!)).toBe(
      "Done",
    );
    expect(contrast?.status).toBe("Todo");
    expect(contrast?.priority).toBe("High");

    for (const issue of STATUS_BOARD_ISSUES) {
      if (issue.title === OMITTED_SHEET_TITLE) continue;
      const row = rows.find((candidate) => candidate.title === issue.title);
      expect(row?.title).toBe(issue.title);
      expect(row?.priority).toBe(issue.priority);
      expect(row?.owner).toBe(issue.owner);
      const expected = sheetStatus(issue);
      expect(row?.status).toBe(expected);
      if (issue.title !== DONE_ON_SHEET_TITLE && issue.title !== TODO_ON_SHEET_TITLE) {
        expect(row?.status).toBe(issue.state);
      }
    }
  });

  it("matches the committed CSV and the header", () => {
    expect([...EPICS_CSV_HEADER]).toEqual([
      "Initiative",
      "Epic",
      "Issue ID",
      "Title",
      "Status",
      "Priority",
      "Owner (fictional)",
      "Target date",
      "Labels",
      "Notes",
    ]);
    const committed = readFileSync(join(root, EPICS_CSV_PATH), "utf8");
    expect(committed).toBe(renderEpicsCsv());
    expect(committed).not.toContain(OMITTED_SHEET_TITLE);
    expect(rows.length).toBe(STATUS_BOARD_ISSUES.length - 1);
  });
});

describe("status demo sources", () => {
  const prd = readFileSync(join(root, "docs/prd-collections-command-center.md"), "utf8");
  const notes = readFileSync(join(root, "docs/design-review-notes.md"), "utf8");
  const readme = readFileSync(join(root, "docs/README.md"), "utf8");
  const update = readFileSync(join(root, "docs/project-update-draft.md"), "utf8");
  const stage = readFileSync(join(root, ".cursor/skills/stage-linear/SKILL.md"), "utf8");

  it("keeps the PRD gaps and leaves the older PRD in place", () => {
    expect(prd).toContain("A Nudge that cannot be emailed shows as failed");
    expect(prd).toContain("visible failed state");
    expect(prd).toContain("Dashboard shows collections totals on the next load");
    expect(prd).toContain("Is the payment-entry screen exempt from amount-gating?");
    expect(readme).toContain("docs/prd-collections-command-center.md");
    expect(readme).toContain("prds/prd-01-collections-command-center.md");
    const titles = STATUS_BOARD_ISSUES.map((issue) => issue.title).join("\n");
    expect(titles).not.toContain("payment-entry");
    expect(titles.toLowerCase()).not.toContain("exempt");
  });

  it("records the three design fails and the app plants", () => {
    expect(notes).toContain("Accessibility contrast tests fail 4.5:1 on badges, muted text, and the up KPI");
    expect(notes).toContain("Nudge failure state not clearly visible");
    expect(notes).toContain("Clicking Overdue or Needs review does not filter the queue");
    expect(notes.match(/\| Fail \|/g)?.length).toBe(3);
    const nudge = readFileSync(join(root, "components/nudge-button.tsx"), "utf8");
    expect(nudge).toContain(".example");
    expect(nudge).toContain("Sent");
    expect(nudge).not.toContain("Failed");
    const pills = readFileSync(join(root, "components/filter-pills.tsx"), "utf8");
    expect(pills).toContain('params.set("state"');
    const invoices = readFileSync(join(root, "app/invoices/page.tsx"), "utf8");
    expect(invoices).toContain("params.status");
    const kpi = readFileSync(join(root, "components/kpi-card.tsx"), "utf8");
    expect(kpi).toContain("Up");
    expect(kpi).toContain("text-success");
  });

  it("tells stage-linear to apply the non-Todo states and not drop the new titles", () => {
    expect(stage).toContain("STATUS_BOARD_ISSUES");
    expect(stage).toContain("A Nudge that cannot be emailed shows as failed");
    expect(stage).toContain("At risk");
    expect(stage).toContain("Never cancel a `STATUS_BOARD_ISSUES` title as an extra");
    expect(readme).toContain("https://linear.app/flylo-air");
    expect(readme).toContain("Make team private");
    expect(update).toContain("Health: At risk");
    expect(update).toContain("Invoice detail has no control to change customer email");
  });

  it("keeps new prose free of em dashes and filler", () => {
    for (const file of [
      "docs/README.md",
      "docs/prd-collections-command-center.md",
      "docs/design-review-notes.md",
      "docs/project-update-draft.md",
      "scripts/generate-epics-csv.ts",
      "scripts/generate-status-pptx.ts",
      "components/nudge-button.tsx",
    ]) {
      expect(readFileSync(join(root, file), "utf8"), file).not.toMatch(banned);
    }
  });

  it("builds a pptx that carries the status lines", () => {
    const deck = buildStatusPptx();
    expect(deck.subarray(0, 2).toString()).toBe("PK");
    const xml = deck.toString("utf8");
    expect(xml).toContain("[Content_Types].xml");
    for (const slide of STATUS_DECK_SLIDES) {
      expect(xml).toContain(slide.title);
    }
    expect(xml).toContain("Health: At risk");
    expect(xml).toContain("Is the payment-entry screen exempt from amount-gating?");
  });
});
