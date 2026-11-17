# PRD: Collections Command Center

**Status:** Draft for the status demo
**Owner:** Nia Okonkwo
**Last updated:** 17 Nov 2026
**Workspace:** Fieldnote Workspace
**Tier availability:** Starter $49, Growth $99, Scale $249

This file is the product source for the status demo. The older draft at `prds/prd-01-collections-command-center.md` stays where it is.

## 1. Overview and purpose

Collections Command Center gives a collections rep one place to work an overdue book. Avery Quinn opens a customer, sees what is owed, writes a note, sends a Nudge, and records a payment without a second tool.

A collections lead uses one dashboard card to see overdue exposure and whether the book was worked today.

The app under test is Ledgerly at http://localhost:43173. Prices stay on the catalog. Customer mail stays on `.example` addresses.

## 2. Target users

**Avery Quinn, collections specialist.** Works one account at a time. Needs the overdue invoices, a place to write what the customer said, a reminder that stays on the account, and a way to record a phone payment.

**Blake Ibarra, collections lead.** Does not work every invoice. Opens the dashboard to see the overdue total, the overdue count, and how many collection actions landed today and in the last 7 days.

Both use Fieldnote Workspace. There is no second operator in this release.

## 3. Problem

Collections work is split across screens and side channels.

- Overdue balances sit on the invoice list. The account itself does not show its own overdue book.
- Notes about a promise to pay live in mail or a private sheet.
- A reminder is not tied back to the invoice.
- A payment taken on the phone is recorded somewhere else, so the invoice can stay overdue after the customer has paid.
- The dashboard has revenue, open invoices, disputes, and collected-this-month. It does not show collections totals.

Reps lose the thread. Leads cannot tell which accounts were touched.

## 4. Goals

- Avery can go from the account to a saved note, a Nudge, and a recorded payment in one flow.
- Every note, Nudge, and payment lands on one account activity feed.
- The dashboard shows collections totals on the next load.
- Dollar amounts in this feature show only for Starter, Growth, and Scale.

## 5. Non-goals

- Multi-step dunning cadences.
- Installment plans.
- Agency handoff or legal escalation.
- SMS or voice. Nudge is email only.
- A second collections card, or a card the lead can reconfigure.
- A fourth catalog price. No Free, Trial, or Enterprise plan id in this release.

## 6. Success metrics

- Share of overdue invoices with at least one activity within 7 days of the due date.
- Days from the first sent Nudge to the payment that marks the invoice paid.
- Share of weeks in which Avery uses note, Nudge, and payment at least once.
- Contrast and keyboard checks for the new UI meet WCAG 2.2 AA before the accessibility milestone.

We will not quote a live DSO number from this demo book. The book is seeded and the clock is frozen at 23 Aug 2026.

## 7. User stories

1. As Avery Quinn, I open Customers and see plan, overdue count, and overdue balance, so I know which account to open first.
2. As Avery Quinn, I open an account and see only its overdue invoices, newest days-past-due first, so I do not scan the whole invoice list.
3. As Avery Quinn, I save a note on the account, so the promise to pay is still there tomorrow.
4. As Avery Quinn, I send a Nudge for an overdue invoice, so the reminder is on the account with the invoice number, balance, and due date.
5. As Avery Quinn, I can tell when a Nudge did not send, so I do not treat a bad address as a delivered reminder.
6. As Avery Quinn, I record a full payment and the invoice leaves the overdue book, so I do not collect it again.
7. As Blake Ibarra, I open the dashboard and see collections totals, so I know the size of the book and whether it was worked today.

## 8. Functional requirements

Acceptance criteria are numbered AC-1 through AC-24. A criterion passes only when the running app matches it.

### 8.1 Customers and the overdue book

**FR-1.** The Customers list opens Account Detail.

**FR-2.** Account Detail includes an Overdue Book of invoices in status OVERDUE, days past due descending.

**FR-3.** Each row shows invoice number, invoice date, due date, days past due, outstanding balance, and last activity. Days past due use the 23 Aug 2026 clock.

**FR-4.** Selecting a row opens the invoice and its line items.

- AC-1. From Customers, Avery can open an account that has at least one OVERDUE invoice and see only that account's overdue rows.
- AC-2. Those rows sort by days past due, longest first, and show the fields in FR-3. Amounts use the catalog format.
- AC-3. Selecting a row opens the existing invoice page and its line items.
- AC-4. An account with nothing overdue shows no invoice rows.

### 8.2 Collection notes

**FR-5.** Avery can save a note with author, time, and an optional invoice.

**FR-6.** Saved notes show newest first on the account activity feed.

**FR-7.** Avery can edit a note for 15 minutes after it is created. Nobody can delete it.

- AC-5. A non-blank note is stored, attributed to Avery Quinn, and shown first on the feed.
- AC-6. A blank note is rejected and the feed does not change.
- AC-7. A note can be tied to one invoice.
- AC-8. Avery can change the body of a note less than 15 minutes old. An older note, or a note from someone else, is rejected and the body stays.
- AC-9. The account has no delete control for a saved note.

### 8.3 Nudge

**FR-8.** Avery can send a Nudge from the account or from one overdue invoice. v1 sends email to the address on file.

**FR-9.** A send writes an activity: type NUDGE_SENT, time, sender, channel, and the invoice when there is one.

**FR-10.** The body is a fixed template. It names the invoice number, the outstanding balance, and the due date. Avery does not edit the body.

**FR-11.** A Nudge that cannot be emailed shows a visible failed state. The account shows the word Failed, in the danger treatment, on the same screen as the send. A muted "Sent" line does not pass.

- AC-10. With a usable address, the feed shows NUDGE_SENT, status sent, channel email, sender Avery Quinn, and the template fields from FR-10.
- AC-11. The account-level Nudge uses the overdue invoice with the most days past due.
- AC-12. When the account has no overdue invoices, the Nudge control is disabled.
- AC-13. When the address is missing or not an email address, the feed shows NUDGE_SENT with status failed, and the screen shows Failed. The request is not dropped.

Issue on the board: `A Nudge that cannot be emailed shows as failed`.

### 8.4 Payments

**FR-12.** Avery can record a payment from the invoice.

**FR-13.** v1 records the full outstanding balance. Methods are check, ACH, card on file, and cash.

**FR-14.** Any other amount is rejected. The invoice stays unpaid.

**FR-15.** A full payment sets the invoice to PAID, sets the paid date to the demo day, and removes it from the Overdue Book.

**FR-16.** The payment writes PAYMENT_RECORDED with amount, method, time, and recorder.

**FR-17.** Avery confirms before the payment is stored. The confirm step shows the amount and the invoice number.

- AC-14. Confirming check, ACH, card on file, or cash for the full outstanding balance sets PAID, removes the invoice from the Overdue Book, and writes the activity.
- AC-15. A second payment against a zero balance is rejected and the status stays.
- AC-16. A posted amount that is not the outstanding balance stores nothing and leaves the status OVERDUE.
- AC-17. The confirm step is the only amount offered, and it names the invoice number.
- AC-18. Payment history lists method, amount, and who recorded it.

### 8.5 One activity feed

**FR-18.** Notes, Nudges, and payments append to one feed on the account, newest first.

- AC-19. After a note, a Nudge, and a payment, Avery can read all three on that feed without opening another tool.

### 8.6 Dashboard collections totals

**FR-19.** The dashboard shows one collections card: overdue balance across accounts, overdue invoice count, activity count for the demo day, and activity count for the 7 days ending that day.

**FR-20.** A note, Nudge, or payment recorded in the session shows up the next time the dashboard loads. This release does not push a live update.

**FR-21.** Anyone who can open the dashboard sees the card. Dollar figures on it follow section 9.

- AC-20. Opening the dashboard shows that card with the four figures in FR-19. Amounts use the catalog format.
- AC-21. After a note, Nudge, or payment, the next dashboard load includes it.
- AC-22. The card uses the existing KPI tokens. It does not introduce a new hex color.

Issue on the board: `Dashboard shows collections totals on the next load`.

### 8.7 Plan gating

**FR-22.** Dollar amounts added by this feature are visible on Starter, Growth, and Scale only. Those prices are $49, $99, and $249.

**FR-23.** On any other plan id, the overdue list, notes, Nudge, status, and activity feed still render. Each dollar figure says "Upgrade to view amounts".

**FR-24.** Recording a payment still stores an amount, so PAID stays correct on a gated plan. Whether the payment-entry screen itself shows that amount is not decided. See open questions.

- AC-23. A Starter, Growth, or Scale account shows dollar figures on the customers list, the Overdue Book, payment history, the activity feed, and the collections card.
- AC-24. A plan id outside those three masks those dollar figures and still shows the rows, notes, Nudge, status, and activity log.

## 9. UX and design requirements

- Customers is in the nav. Account Detail is a page, not a modal.
- The Overdue Book is a list, not a second invoice table with new columns beyond FR-3.
- Nudge sits on the account and on the overdue row. It does not replace the unfinished collection-note card on invoice detail.
- A failed Nudge is visible without opening the activity payload. Muted text that says Sent fails FR-11.
- The collections card matches the other KPI cards in type size and token use.
- Filter controls that say Overdue or Needs review must change the list they sit on. A control that only rewrites the query string fails review.
- Badge text, muted text, and the up KPI must be readable on their backgrounds. See section 10.
- Empty overdue books show a plain empty state, not sample rows.

## 10. Non-functional requirements

### Accessibility

WCAG 2.2 Level AA.

- Text contrast is at least 4.5:1, including badges, muted text, and the up KPI.
- The check for that contrast is `npm run test:a11y`. It stays out of `npm test`.
- New UI also needs the manual keyboard walkthrough: Tab, Shift+Tab, Enter, and Escape on the running app. Reading the markup is not the audit.
- The walkthrough issue is `UI changes need a WCAG 2.2 AA accessibility audit`.
- The contrast issue is `Accessibility contrast tests fail 4.5:1 on badges, muted text, and the up KPI`.

### Performance

- Account Detail includes the Overdue Book in the first response.
- The collections card is part of the dashboard response. It does not wait on a second request.
- Totals update on the next load. They do not require a socket.

## 11. Dependencies

- Catalog prices in the plan list: Starter $49, Growth $99, Scale $249.
- Demo clock 23 Aug 2026.
- The invoice list, invoice detail, and dispute queue already in Ledgerly.
- The Linear project that holds the Collections Command Center slices and the Fieldnote quality issues. Titles are the ones in `runbooks/linear-field-demos.ts`.

## 12. Release plan

| Milestone | Date | Exit |
| --- | --- | --- |
| M1. Overdue book and notes | 25 Sep 2026 | AC-1 through AC-9 on a seeded account |
| M2. Nudge and payments | 9 Oct 2026 | AC-10 through AC-19, including the visible failed Nudge |
| M3. Dashboard, plan gate, accessibility | 23 Oct 2026 | AC-20 through AC-24, keyboard walkthrough, and `npm run test:a11y` at 4.5:1 |

Ship to the Fieldnote collections desk first. Do not add a plan id outside Starter, Growth, and Scale in order to demo the mask. Cover the mask with a unit test that passes a non-catalog id.

## 13. Risks

- A failed Nudge that still reads as sent will be counted as contact made.
- Dashboard collections totals can miss a payment if the card is not on the next load.
- Contrast failures on badges and the up KPI can block M3 even when the flow works.
- If a non-matching payment amount is accepted, an invoice will show paid before the customer has paid it.
- The payment-entry gate is still an open question. Building the confirm screen before it is decided will rework the mask.

## 14. Open questions

1. Is the payment-entry screen exempt from amount-gating? Avery has to see the balance to record the right payment. The mask in FR-23 might still hide that amount, or the entry screen might be the exception. This PRD does not decide.

Decided, and not open:

- Methods are check, ACH, card on file, and cash.
- A partial amount is rejected. It does not mark the invoice paid.
- The edit window is 15 minutes, author only, no delete.
- Nudge is email only.
- There is no Free, Trial, or Enterprise plan in this catalog. Any other plan id is masked.
