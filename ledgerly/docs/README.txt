Ledgerly docs for the call reminder roadmap

This folder is the source pack for the call reminder roadmap. The plan covers next quarter, 2027 Q1, from January through March 2027. The feature is payment reminders by phone call. Ledgerly places an automated voice call to remind a customer about an upcoming invoice or an overdue invoice. The voice is Grok Voice, and it is mocked. There is no live call, no phone number, and no provider key in this pack.

The app's Collections and Disputes areas are out of scope for this demo.

The presenter stages the epics once, from issues/dependencies.txt and the epic files. The staged board shows the plan in the tracker for the roadmap video. The docs are what you check.

Each person reads two sources. The demo output is a Canvas roadmap, then a short video walkthrough of that canvas. The video is about two minutes long.

Who reads which two sources
The project manager reads issues/dependencies.txt and product/roadmap-update.txt.
The product manager reads product/prd-call-reminders.txt and issues/dependencies.txt.
The designer reads design/call-reminders-review.txt and the epic files in issues/: call-scheduling.txt, call-scripts.txt, consent-opt-out.txt, call-outcomes.txt, retry-rules.txt, call-dashboard.txt, and pay-link.txt.

Replace <project> with your project in your tracker, for example your Ledgerly project in Linear.

How to build the Canvas roadmap
Read your two sources.
Build a Canvas roadmap for 2027 Q1.
Show the planned epics, the order, and the milestone target dates.

How to record the video
Start a screen recording after the canvas is up.
Walk through the Canvas roadmap.
Say which two sources you read and what you compared.
Go to http://localhost:43173 when a file describes the current screen. Go to an invoice, then go to Settings.
Stop the recording at about two minutes.
Add a link to the Canvas, or a screenshot if viewers can't open it, to the project update for <project>. Post the video on that same update.

What the files are
issues/dependencies.txt is the planning source of truth for order, blockers, and dates. Each epic is one plain text file in issues/.
product/prd-call-reminders.txt is the product requirements document for call reminders on Grok Voice.
product/roadmap-update.txt is the next-quarter roadmap update.
design/call-reminders-review.txt covers the call flow, the call settings screen, and the transcript view on the invoice. Numbered decisions use DR (design review decision), starting at DR-1.

How to check the app
Go to http://localhost:43173. Go to an invoice page and the settings page. The app is the source for what the screen shows today. These docs do not change the app.

Scope of this pack
Stay inside payment reminders by phone call. Scheduling, scripts, consent, outcomes, retries, a results view, and a pay link are the topics in this pack.
