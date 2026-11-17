Ledgerly docs for the call reminder demo

This folder is the source pack for a steel-thread demo. The feature is payment reminders by phone call. Ledgerly places an automated voice call to remind a customer about an upcoming invoice or an overdue invoice. The voice is Grok Voice, and it is mocked. There is no live call, no phone number, and no provider key in this pack.

Three people use the pack. Each person reads one folder, checks it against the Linear board, and checks it against the running app at http://localhost:43173. Each person then builds a Canvas status report and records a walkthrough video for a Linear project update.

issues/
The project manager uses this folder. index.txt lists every epic and its issues. Each epic is one plain text file. Copy the issues onto the Linear board, then compare the board with these files. Keys look like LEDGERLY-100. Status values are Done, In Progress, Todo, and Backlog.

product/
The product manager uses this folder. prd-call-reminders.txt is the product requirements document for call reminders on Grok Voice. project-update.txt is a draft the team can record against for the Linear project update.

design/
The designer uses this folder. call-reminders-review.txt covers the call flow, the call settings screen, and the transcript view on the invoice. Numbered decisions look like DR-1.

How to check the app
Open http://localhost:43173. Read an invoice page and the settings page. The app is the source for what the screen shows today. These docs do not change the app.

Scope of this pack
Stay inside payment reminders by phone call. Scheduling, scripts, consent, outcomes, retries, a results view, and a pay link are the topics in this pack. Do not add other product tracks to these files.
