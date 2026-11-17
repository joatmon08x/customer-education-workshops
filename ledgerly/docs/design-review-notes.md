# Design review: Collections Command Center

**Reviewer:** Indra Solano
**Date:** 17 Nov 2026
**Build:** Ledgerly, http://localhost:43173
**Theme checked:** light
**Clock:** 23 Aug 2026

## Screens reviewed

| Screen | URL | What was on screen |
| --- | --- | --- |
| Dashboard | http://localhost:43173/ | Four KPI cards. No collections card. Collected This Month shows the word Up in green on the white card. |
| Invoices | http://localhost:43173/invoices | Status pills, search field, invoice table, Paid / Open / Overdue badges. |
| Invoice detail | http://localhost:43173/invoices/inv_1043 | Customer email, line items, unfinished collection note. No Nudge control on this card. |
| Collections | http://localhost:43173/collections | Overdue rows, address ending in `.example`, Nudge button. |
| Disputes | http://localhost:43173/disputes | Needs review pill and the dispute queue. |
| Sidebar | every page | Collections queue callout on the indigo panel. |

Screenshots are named below. They are not in git. The presenter captures them during the walkthrough if a slide needs them.

## Findings

| ID | Screen | Finding | Severity | Status | Screenshot |
| --- | --- | --- | --- | --- | --- |
| DR-1 | Invoices, sidebar, dashboard | Accessibility contrast tests fail 4.5:1 on badges, muted text, and the up KPI | High | Fail | screenshots/dr-01-contrast.png |
| DR-2 | Collections | Nudge failure state not clearly visible | High | Fail | screenshots/dr-02-nudge.png |
| DR-3 | Invoices and Disputes | Clicking Overdue or Needs review does not filter the queue | High | Fail | screenshots/dr-03-filters.png |
| DR-4 | Invoices | Amounts on seeded rows are Starter $49, Growth $99, or Scale $249 | Low | Pass | |
| DR-5 | Invoice detail | Customer email is visible on the customer card | Low | Pass | |
| DR-6 | Collections | The queue lists overdue invoices only, with days past due | Low | Pass | |
| DR-7 | Dashboard | No collections totals card | Medium | Noted | |

Noted is not a scored fail. DR-7 is the missing card from `Dashboard shows collections totals on the next load`. The scored fails are DR-1, DR-2, and DR-3.

## How to reproduce

### DR-1. Contrast

1. Open http://localhost:43173/invoices in the light theme.
2. Read Paid, Open, and Overdue badges. Text sits on the soft green, amber, and red fills. Those pairs are under 4.5:1.
3. Read the search field placeholder (muted text on the muted fill) and the sidebar line "Overdue invoices and dunning notes sit in the collections queue" (muted text on the indigo panel).
4. Open http://localhost:43173/. On Collected This Month, the word Up is green on the white card. The percent is hidden when the lift is over 80. The word uses the same success-on-card pair, and that pair is under 4.5:1.
5. `npm run test:a11y` fails those pairs. `npm test` does not run that file.

### DR-2. Nudge failure state

1. Open http://localhost:43173/collections.
2. Pick any overdue row. The address ends in `.example`.
3. Click Nudge.
4. The new line reads Sent, in muted text. It does not say Failed, and it does not use the danger treatment.
5. This build treats a `.example` address as undeliverable. The control still copies a successful send.

Related issue: `A Nudge that cannot be emailed shows as failed`.

### DR-3. Filters

1. Open http://localhost:43173/invoices. Click Overdue.
2. The URL becomes `?state=OVERDUE`. The table still lists every invoice. All stays highlighted. The page reads `status`, and the pills write `state`.
3. Open http://localhost:43173/disputes. Click Needs review.
4. The queue still lists every dispute. The URL uses `state`.

Issue title, same words: `Clicking Overdue or Needs review does not filter the queue`.

## Pass notes

DR-4. Spot-checked INV-1043 (Scale $249) and the collections rows. No fourth price.

DR-5. Invoice detail shows the seeded contact email. There is no editor on that card. That missing editor is a separate story, not a fail in this review.

DR-6. Collections does not mix in open or paid invoices. Days past due match the 23 Aug 2026 clock.
