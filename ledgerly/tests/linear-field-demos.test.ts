import { describe, expect, it } from "vitest";
import {
  COLLECTIONS_COMMAND_CENTER_ISSUES,
  COLLECTIONS_COMMAND_CENTER_LINEAR,
  collectionsCommandCenterDescription,
  FIELD_DEMO_FILTER_TITLE,
  FIELD_DEMO_ISSUES,
  FIELD_DEMO_SUGGESTED_CREDIT_TITLE,
  LINEAR_FIELD_DEMOS_PROJECT,
  WCAG_CONTRAST_TEST,
  WCAG_KEYBOARD_WALKTHROUGH,
} from "@/runbooks/linear-field-demos";

describe("ce-field-demos Linear book", () => {
  it("keeps the three scoped issues and catalog prices", () => {
    expect(LINEAR_FIELD_DEMOS_PROJECT.name).toBe("ce-field-demos");
    expect(LINEAR_FIELD_DEMOS_PROJECT.catalogPricesUsd).toEqual(["$49", "$99", "$249"]);
    expect(FIELD_DEMO_ISSUES.map((issue) => issue.slug)).toEqual([
      "suggested-credit-v1",
      "filter-pills",
      "email-on-invoice",
    ]);
    expect(FIELD_DEMO_ISSUES[1]?.title).toBe(
      "Clicking Overdue or Needs review does not filter the queue",
    );
    expect(FIELD_DEMO_SUGGESTED_CREDIT_TITLE).toBe(
      "Suggested credit on dsp_1043 shows $400 instead of the $249 Scale cap",
    );
    expect(FIELD_DEMO_FILTER_TITLE).toBe(
      "Clicking Overdue or Needs review does not filter the queue",
    );
    const filter = FIELD_DEMO_ISSUES.find((issue) => issue.slug === "filter-pills")!;
    expect(filter.description).toContain("## Scope");
    expect(filter.description).toContain("## Acceptance criteria");
    expect(filter.description).toContain("## Proof");
    expect(filter.description).toContain("## Judgment calls");
    expect(filter.description).toContain("Align that key with the key the pages");
    expect(filter.description).toContain("A test that the Overdue pill");
    expect(FIELD_DEMO_ISSUES.map((issue) => issue.previousTitles?.[0])).toEqual([
      "Dispute dsp_1043 claims $400 against a $249 Scale invoice",
      "Overdue / Needs review filter does not change the list",
      "Change customer email on invoice detail",
    ]);
  });

  it("keeps Collections Command Center slices out of FIELD_DEMO_ISSUES and tags their Linear bodies", () => {
    expect(COLLECTIONS_COMMAND_CENTER_ISSUES.map((issue) => issue.slug)).toEqual([
      "overdue-book",
      "full-payment",
      "reject-other-amount",
      "collection-note",
      "note-edit-window",
      "nudge-sent",
      "nudge-failed",
      "collections-kpi",
      "amount-mask",
    ]);
    const fieldTitles = new Set(FIELD_DEMO_ISSUES.map((issue) => issue.title));
    expect(COLLECTIONS_COMMAND_CENTER_LINEAR.state).toBe("Todo");
    expect(COLLECTIONS_COMMAND_CENTER_LINEAR.priority).toBe(3);
    expect(COLLECTIONS_COMMAND_CENTER_LINEAR.note).toContain("Collections Command Center feature");
    for (const [index, issue] of COLLECTIONS_COMMAND_CENTER_ISSUES.entries()) {
      expect(fieldTitles.has(issue.title)).toBe(false);
      const description = collectionsCommandCenterDescription(issue);
      expect(description.startsWith(COLLECTIONS_COMMAND_CENTER_LINEAR.note)).toBe(true);
      expect(description).toContain(`Slice ${index + 1} of ${COLLECTIONS_COMMAND_CENTER_ISSUES.length}`);
      const covers = issue.covers.map((id) => id.replaceAll("-", "\u2011")).join(", ");
      expect(description).toContain(`Covers ${covers}`);
      expect(description).not.toMatch(/FR-\d/);
      expect(description).toContain("## Acceptance");
      expect(description).not.toMatch(/\$(79|199)\b/);
    }
    const covered = COLLECTIONS_COMMAND_CENTER_ISSUES.flatMap((issue) => [...issue.covers]);
    expect(covered).toEqual([
      "FR-1",
      "FR-2",
      "FR-3",
      "FR-4",
      "FR-12",
      "FR-13",
      "FR-15",
      "FR-16",
      "FR-17",
      "FR-18",
      "FR-14",
      "FR-5",
      "FR-6",
      "FR-7",
      "FR-8",
      "FR-9",
      "FR-10",
      "FR-11",
      "FR-19",
      "FR-20",
      "FR-21",
      "FR-22",
      "FR-23",
      "FR-24",
    ]);
  });

  it("keeps the WCAG audit as a manual keyboard walkthrough outside the twelve titles", () => {
    expect(WCAG_KEYBOARD_WALKTHROUGH.title).toBe(
      "UI changes need a WCAG 2.2 AA accessibility audit",
    );
    expect(WCAG_KEYBOARD_WALKTHROUGH.state).toBe("Todo");
    expect(WCAG_KEYBOARD_WALKTHROUGH.priority).toBe(3);
    expect(
      WCAG_KEYBOARD_WALKTHROUGH.description.startsWith(
        "## Story\n\nThis issue is a manual keyboard walkthrough.",
      ),
    ).toBe(true);
    expect(WCAG_KEYBOARD_WALKTHROUGH.description).toContain("That is the WCAG 2.2 Level AA audit.");
    expect(WCAG_KEYBOARD_WALKTHROUGH.description).toContain("Tab, Shift+Tab, Enter, and Escape");
    expect(FIELD_DEMO_ISSUES.some((issue) => issue.title === WCAG_KEYBOARD_WALKTHROUGH.title)).toBe(
      false,
    );
    expect(
      COLLECTIONS_COMMAND_CENTER_ISSUES.some((issue) => issue.title === WCAG_KEYBOARD_WALKTHROUGH.title),
    ).toBe(false);

    expect(WCAG_CONTRAST_TEST.title).toBe(
      "Accessibility contrast tests fail 4.5:1 on badges, muted text, and the up KPI",
    );
    expect(WCAG_CONTRAST_TEST.state).toBe("Todo");
    expect(WCAG_CONTRAST_TEST.priority).toBe(2);
    expect(WCAG_CONTRAST_TEST.description.startsWith("## Bug\n\n`npm run test:a11y`")).toBe(true);
    expect(WCAG_CONTRAST_TEST.description).toContain("## Scope");
    expect(WCAG_CONTRAST_TEST.description).toContain("## Acceptance criteria");
    expect(WCAG_CONTRAST_TEST.description).toContain("## Proof");
    expect(WCAG_CONTRAST_TEST.description).toContain("## Judgment calls");
    expect(WCAG_CONTRAST_TEST.description).toContain("tests/a11y/contrast.test.ts");
    expect(WCAG_CONTRAST_TEST.description).toContain("Do not edit `tests/a11y/contrast.test.ts`");
    expect(WCAG_CONTRAST_TEST.description).toContain("7 failed / 83 passed");
    expect(WCAG_CONTRAST_TEST.description).toContain("0 failed / 90 passed");
    expect(WCAG_CONTRAST_TEST.description).toContain("1 failed / 32 passed");
    expect(WCAG_CONTRAST_TEST.title).not.toBe(WCAG_KEYBOARD_WALKTHROUGH.title);
    expect(FIELD_DEMO_ISSUES.some((issue) => issue.title === WCAG_CONTRAST_TEST.title)).toBe(false);
    expect(
      COLLECTIONS_COMMAND_CENTER_ISSUES.some((issue) => issue.title === WCAG_CONTRAST_TEST.title),
    ).toBe(false);
  });
});
