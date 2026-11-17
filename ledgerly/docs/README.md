# Ledgerly status demo

Steel thread for a project manager, a product manager, and a designer. Each person starts from a different source, checks it against the work, builds a one-page status Canvas, records a short walkthrough, and adds that video to a Linear project update.

The work is the same for every role:

1. Pull the source doc in this folder.
2. Check it against the Linear board, the epics sheet, and Ledgerly at http://localhost:43173.
3. Build a one-page status Canvas.
4. Record a short walkthrough. Attach it to a Linear project update. If the update cannot take a video, use `ledgerly-status.pptx`.

The presenter records the video. Do not commit a video file.

## Which file, which role

| File | Role | What it is |
| --- | --- | --- |
| `collections-command-center-epics.csv` | Project manager | Epics sheet. Two initiatives, six epics. |
| `prd-collections-command-center.md` | Product manager | Demo PRD. This is the product source for the demo. |
| `design-review-notes.md` | Designer | One design review, with pass and fail rows. |
| `project-update-draft.md` | Any role | Paste-ready Linear project update. Health: At risk. |
| `ledgerly-status.pptx` | Any role | Fallback deck when the update cannot take a video. |

`prds/prd-01-collections-command-center.md` is the older draft. Leave that file untouched. The demo source is `docs/prd-collections-command-center.md`.

Titles are shared with `runbooks/linear-field-demos.ts`. When a title shows up in the sheet, the PRD, the notes, or this page, it is the same string as on the board.

## Planted gaps

These are intentional. The generator writes the sheet gaps on purpose. See the comment in `scripts/generate-epics-csv.ts`.

| # | Where | What you should find |
| --- | --- | --- |
| a | Sheet vs board | `Invoice detail has no control to change customer email` is on the board as Todo. It is not in the CSV. |
| b | Sheet vs board | `Dashboard shows collections totals on the next load` is Done in the CSV. It is In Progress on the board. |
| c | Sheet vs board | `Accessibility contrast tests fail 4.5:1 on badges, muted text, and the up KPI` is Todo in the CSV. On the board it is At risk, priority High. The CSV priority stays High. The status is the mismatch. |
| d | PRD vs board | The PRD says a Nudge that cannot be emailed must show a visible failed state. `A Nudge that cannot be emailed shows as failed` is still In Progress. |
| e | PRD vs board | The PRD requires the dashboard collections card. `Dashboard shows collections totals on the next load` is In Progress. |
| f | PRD vs board | Open question, and no issue is filed for it: Is the payment-entry screen exempt from amount-gating? `Dollar amounts stay masked outside Starter, Growth, and Scale` mentions the confirm screen in its build notes. That issue does not ask the question, and the PRD has not closed it. |
| g | Review vs app | Contrast fails 4.5:1 on badges, muted text, and the up KPI. `npm run test:a11y` fails those pairs. On the dashboard, Collected This Month shows Up in green on the white card when the percent is over 80. |
| h | Review vs app | Nudge failure state is not clearly visible. On http://localhost:43173/collections, Nudge reads Sent in muted text. Seed addresses end in `.example`, which this control treats as undeliverable. |
| i | Review vs app | `Clicking Overdue or Needs review does not filter the queue`. The pills write `state`. The invoice and dispute pages read `status`. |

Issue IDs in the CSV (`LY-301` and the rest) are sheet keys. Linear mints a different identifier on each project. Match rows to the board by title.

## Regenerate the CSV

From `ledgerly/`:

```bash
npm run docs:epics-csv
```

That writes `docs/collections-command-center-epics.csv`. The script reads titles, owners, and board status from `STATUS_BOARD_ISSUES` in `runbooks/linear-field-demos.ts`, then applies gaps a, b, and c. Commit the CSV after you regenerate it.

## Regenerate the PPTX

```bash
npm run docs:status-pptx
```

That writes `docs/ledgerly-status.pptx` with no extra npm package. The script builds a small Office Open XML zip. Use the deck only when the Linear update cannot hold the video.

## Stage Linear

Workspace: FlyLo, https://linear.app/flylo-air.

Each person uses a private team and a private project. Linear cannot create the team for you.

1. Open https://linear.app/flylo-air and sign in.
2. Settings, Teams, New team. Name it for this person only.
3. Turn on **Make team private**. Members are only that person. The team key can be LY. Confirm it at `https://linear.app/flylo-air/settings/teams/LY` if the key is LY. If Linear assigns another key, use that key in the URL.
4. Add a workflow state named `At risk` if the team does not have one. Team settings, Workflow. The contrast issue uses that exact name.
5. Run `stage-linear`. Tell it the team, the project name, and that the project must be private. `stage-linear` leaves a project public unless you ask for private. It does not invent the project name. It confirms the team before it writes.
6. `stage-linear` reopens catalog issues to Todo, creates any missing `STATUS_BOARD_ISSUES` title, then sets the three non-Todo states:
   - `A Nudge that cannot be emailed shows as failed`: In Progress
   - `Dashboard shows collections totals on the next load`: In Progress
   - `Accessibility contrast tests fail 4.5:1 on badges, muted text, and the up KPI`: At risk, priority High

The active issues on that project should be exactly the `STATUS_BOARD_ISSUES` titles. The sheet has one fewer row, because of gap a.

## Reset

From `ledgerly/`:

```bash
npm run demo:reset
```

Then run `reset-demo-state` for anything the script still reports. That skill cancels the recorded Linear issues and cancels the project. Issues stay linked. The private team stays. The next `stage-linear` reopens the board.

One reset covers the whole demo. There is no separate reset for this folder.
