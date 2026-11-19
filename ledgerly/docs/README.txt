Ledgerly docs for the weekly status update

This folder is the source pack for a weekly status update. Ledgerly is a fictional billing operations product. The sample work is payment reminders by phone call. The voice is mocked. There is no live call, no phone number, and no provider key in this pack.

The app's Collections and Disputes areas are out of scope for this demo.

The status week is the week of 2026-11-16. Last week means the week of 2026-11-09. The status update has three sections: Last week (what you did), This week (what you'll do), and Upcoming.

Each person reads the files for their kind of work. The demo output is a one-page Canvas status update, then a 30-second walkthrough video of that Canvas.

Who reads which files
The project manager reads the project docs: issues/dependencies.txt and product/status-update.txt.
The product manager reads the product docs: product/prd-call-reminders.txt, checked against issues/dependencies.txt.
The designer reads the design docs: design/call-reminders-review.txt, checked against the epic files in issues/: call-scheduling.txt, call-scripts.txt, consent-opt-out.txt, call-outcomes.txt, retry-rules.txt, call-dashboard.txt, and pay-link.txt.

<project> means the Linear project you staged or brought.
<plan> is project status for the project manager, product status for the product manager, and design status for the designer.
The delivery issue in <project> is titled Deliver status update walkthrough video.

How to build the Canvas status update
Read the files for your role.
Check them against each other, and against the app when a file describes a current screen.
Build a one-page Canvas <plan> update with three sections: Last week, This week, and Upcoming.
Keep every work item, status, and gap.

How the video is made
The agent records a 30-second walkthrough of the Canvas status update: Last week, This week, then Upcoming.
Add a link to the Canvas, or a screenshot if viewers can't open it, to the Deliver status update walkthrough video issue and to the project update for <project>. Post the video on both.

What the files are
issues/dependencies.txt is the work list and the source of truth for status, owner, week, and blockers. Each work item is one plain text epic file in issues/.
Status values are Done, In progress, Blocked, and Not started. Week values are Last week, This week, and Upcoming.
product/prd-call-reminders.txt is the product requirements document for call reminders.
product/status-update.txt is last week's posted status update, dated 2026-11-13.
design/call-reminders-review.txt covers the call flow, the call settings screen, and the transcript view on the invoice. Numbered decisions use DR (design review decision), starting at DR-1.

How to check the app
Check the app only when a file describes the current screen. Go to http://localhost:43173. Go to an invoice page and the settings page. The app is the source for what the screen shows today. These docs do not change the app.

Scope of this pack
Stay inside payment reminders by phone call. Scheduling, scripts, consent, outcomes, retries, a results view, and a pay link are the topics in this pack.
