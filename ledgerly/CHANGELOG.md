# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### In progress

- **201 track** — Runbooks track `201` / `RUNBOOK_SECTIONS_201` is on main for CE workshop demos (Outline Show beats, Linear staging, disk plugin) but is not a formal release in this cut.
- **301 track.** Runbooks track `301` / `RUNBOOK_SECTIONS_301` adds the Outline Show for orchestrating agents, tasks, and coworkers (four sections, 35 beats: 11, 12, 5, 7). Not a formal release in this cut.
- **401 track.** Runbooks track `401` / `RUNBOOK_SECTIONS_401` adds the Outline Show for delegating to asynchronous agents (three sections, 16 beats: 3, 6, 7). Tabs are the Show-owning headings, not Morning / Midday / Afternoon. Not a formal release in this cut.

### Added

- `preflight-checker` project agent. Before a 101 / 201 / 301 session, reports pass / fail / blocked per track dependency. `readonly` is false so it can run shell probes; its instructions forbid edits, install, seed, `stage-linear`, and `mcp_auth` unless the operator asks to remediate.
- Optional runbook beats record a feature name from the Outline tag. Each track lists those features as checkboxes, on by default. Turning one off hides its beats and the browser remembers the choice.
- `change-reviewer` project agent. Diff inspection for the 301 review beat. `readonly` is false so it can run `git status` and `git diff`; its instructions forbid edits. It owns the closer-inspection list: authentication, payments, personal data, permissions, or secrets; difficult rollback; missing tests; a test an agent edited; scope outside the plan; and new dependencies or shell commands. Like `ledgerly-reviewer`, it reports Passed and Incomplete, with high, warning, and suggestion inside Incomplete.

### Changed

- Synced 301 Show beats to the live Outline. The Cloud Agents opener is one Do plus a /plan prompt, the subagent step uses the Outline title, and the Projects Do names the remaining prompts in this demo section.
- `README.md`, `AGENTS.md`, and `choose-cursor-workflow` tell you to run `preflight-checker` with the track id before a demo.
- `npm run demo:reset` now deletes local `cursor/*` and `demo/*` branches, recorded remotes on those patterns, and extra demo worktrees, then prunes worktrees. Cloud agent runs stay manual. Removing a demo worktree discards uncommitted files in that directory.
- Dry-run summaries match the checkout a real reset would leave, including a prunable demo worktree.
- Change reviewer catalog copy matches `readonly: false`: it can run `git status` and `git diff`, and its instructions still forbid edits.
- Synced 301 Show beats to the accepted Outline: the in-scope keyboard plan and its Say, `readonly: false` on the accessibility manual reviewer, stop that reviewer after one failure, the Linear fallback file `@runbooks/linear-field-demos.ts`, change-reviewer `readonly: false`, and the closer-inspection beat that flags the planted Tab step as high and never kept.
- The W2 keyboard task includes a deliberate Tab `preventDefault` step for the 301 demo. See Planted demo issues in `AGENTS.md` and `README.md`. The plan does not label it.
- Runbook cards show Say, then the Do lines in their own box, then the prompt. Several Do lines are numbered. The box matches the prompt border, radius, and padding, with the indigo soft fill and no copy button.
- 301 beats now copy Say, Do, and Prompt from the live Outline, including optional feature tags. Three Show steps that were missing are now beats.
- The side-question step uses two cards. side-chat keeps the Outline heading. ask-subagent-progress is titled Ask what the first subagent is remediating.
- **301 beats synced to the Outline.** Four sections hold 11, 12, 5, and 7 beats (35 total). The review section has no keyboard-confirmation step.
- `ledgerly-reviewer` no longer carries the closer-inspection list. It confirms the claimed work runs, then checks the catalog, seed, and protected paths.
- Runbooks left the app. The catalog is `runbooks.html`, rendered in a Cursor Canvas by `start-ledgerly`.

## [1.0.0] - 2026-09-15

First stable release of Ledgerly as the CE field-demo app for Adopting Grok Build for AI Development.

### Released

- **101 track** — Runbooks track `101` / `RUNBOOK_SECTIONS_101` released for CE workshop demos (Adopting Grok Build for AI Development). Workshop beats are aligned to the Adopting Grok Build Outline.

### Added

- Ledgerly demo app: Fieldnote Workspace billing ops (dashboard, invoices, collections, disputes, settings). Catalog prices stay Starter $49, Growth $99, Scale $249.
- Copy-paste runbook beats in `runbooks.html` (tracks 101 and 201); presenter run-of-show in `demo-howto.md`.
- Project agents (`ledgerly-reviewer`, `api-instrumenter`, `dispute-verifier`) and skills for demo reset, Prisma lookups, workflow choice, and Cloud Agent handoff.

### Changed

- 101 govern-rule, MCP/Figma, and checkpoint-restore beats synced to the Adopting Grok Build Outline Show wording.

[Unreleased]: https://github.com/xai-org/customer-education-workshops/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/xai-org/customer-education-workshops/releases/tag/v1.0.0
