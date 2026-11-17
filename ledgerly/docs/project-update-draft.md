Health: At risk

Collections Command Center, 17 Nov 2026. Fieldnote Workspace.

The epics sheet, the PRD, and the board do not match. The app at http://localhost:43173 still shows the three review fails below.

Sheet vs board

- `Invoice detail has no control to change customer email` is on the board as Todo. It is missing from the sheet.
- `Dashboard shows collections totals on the next load` is Done on the sheet. It is In Progress on the board. The dashboard has no collections card.
- `Accessibility contrast tests fail 4.5:1 on badges, muted text, and the up KPI` is Todo on the sheet. On the board it is At risk, priority High. `npm run test:a11y` still fails those pairs.

PRD vs board

- The PRD requires a visible failed state when a Nudge cannot be emailed. `A Nudge that cannot be emailed shows as failed` is still In Progress. On Collections, Nudge reads Sent in muted text for a `.example` address.
- The PRD requires dashboard collections totals. That issue is In Progress.
- Open question, with no issue filed for it: Is the payment-entry screen exempt from amount-gating?

App check

- Clicking Overdue or Needs review does not filter the queue.
- Badges, the sidebar muted line, and the Up word on Collected This Month fail 4.5:1.

Walkthrough video: the presenter records it and attaches it to this update. The video is not in the repo. If the update cannot take a video, attach `docs/ledgerly-status.pptx` instead. Regenerate that file with `npm run docs:status-pptx`.
