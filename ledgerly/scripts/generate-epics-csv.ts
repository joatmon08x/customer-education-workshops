import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  COLLECTIONS_COMMAND_CENTER_ISSUES,
  FIELD_DEMO_ISSUES,
  STATUS_BOARD_ISSUES,
  WCAG_CONTRAST_TEST,
  type StatusBoardIssue,
  type StatusBoardState,
} from "@/runbooks/linear-field-demos";

/**
 * Deliberate spreadsheet gaps vs the Linear board (`STATUS_BOARD_ISSUES`).
 * These are not drift. Do not "correct" them.
 *
 * (a) Omit "Invoice detail has no control to change customer email".
 *     It stays on the board as Todo.
 * (b) "Dashboard shows collections totals on the next load" is Done on the sheet.
 *     The board state is In Progress.
 * (c) "Accessibility contrast tests fail 4.5:1 on badges, muted text, and the up KPI"
 *     is Todo on the sheet. The board state is At risk and the priority is High.
 *     Priority is not changed. High on the sheet matches High on the board.
 */
export const OMITTED_SHEET_TITLE = FIELD_DEMO_ISSUES.find(
  (issue) => issue.slug === "email-on-invoice",
)!.title;

export const DONE_ON_SHEET_TITLE = COLLECTIONS_COMMAND_CENTER_ISSUES.find(
  (issue) => issue.slug === "collections-kpi",
)!.title;

export const TODO_ON_SHEET_TITLE = WCAG_CONTRAST_TEST.title;

export type SheetState = StatusBoardState | "Done";

export type EpicSheetRow = {
  initiative: string;
  epic: string;
  issueId: string;
  title: string;
  status: SheetState;
  priority: StatusBoardIssue["priority"];
  owner: string;
  targetDate: string;
  labels: string;
  notes: string;
};

export function sheetStatus(issue: StatusBoardIssue): SheetState {
  if (issue.title === DONE_ON_SHEET_TITLE) return "Done";
  if (issue.title === TODO_ON_SHEET_TITLE) return "Todo";
  return issue.state;
}

export function epicSheetRows(): EpicSheetRow[] {
  return STATUS_BOARD_ISSUES.filter((issue) => issue.title !== OMITTED_SHEET_TITLE).map((issue) => ({
    initiative: issue.initiative,
    epic: issue.epic,
    issueId: issue.sheetId,
    title: issue.title,
    status: sheetStatus(issue),
    priority: issue.priority,
    owner: issue.owner,
    targetDate: issue.targetDate,
    labels: issue.labels.join(", "),
    notes: issue.notes,
  }));
}

export const EPICS_CSV_HEADER = [
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
] as const;

function csvField(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function renderEpicsCsv(rows: readonly EpicSheetRow[] = epicSheetRows()): string {
  const lines = [
    EPICS_CSV_HEADER.join(","),
    ...rows.map((row) =>
      [
        row.initiative,
        row.epic,
        row.issueId,
        row.title,
        row.status,
        row.priority,
        row.owner,
        row.targetDate,
        row.labels,
        row.notes,
      ]
        .map(csvField)
        .join(","),
    ),
  ];
  return `${lines.join("\n")}\n`;
}

export const EPICS_CSV_PATH = join("docs", "collections-command-center-epics.csv");

function isDirectRun(): boolean {
  const entry = process.argv[1] ?? "";
  return entry.endsWith("generate-epics-csv.ts") || entry.endsWith("generate-epics-csv.js");
}

if (isDirectRun()) {
  const target = join(process.cwd(), EPICS_CSV_PATH);
  writeFileSync(target, renderEpicsCsv());
  console.log(`Wrote ${EPICS_CSV_PATH} (${epicSheetRows().length} rows)`);
}
