Ledgerly docs for the call reminder demo

This folder is the source pack for the call reminder demo. The feature is payment reminders by phone call. Ledgerly places an automated voice call to remind a customer about an upcoming invoice or an overdue invoice. The voice is Grok Voice, and it is mocked. There is no live call, no phone number, and no provider key in this pack.

The app's Collections and Disputes areas are out of scope for this demo.

The presenter stages the epics once, from issues/dependencies.txt and the epic files. Each person then reads two files, checks them against the running app, builds a Canvas status report, and records a video.

The video is about two minutes long. It goes on the Linear project update, or on the project update for any tracker the board uses.

How to record the video
Start a screen recording.
Go to http://localhost:43173.
Go to an invoice.
Go to Settings.
Say which two files you read and what you compared.
Stop the recording at about two minutes.
Attach the video to the Linear project update, or to the project update on the tracker you use.

Who reads which two files
The project manager reads issues/dependencies.txt and the epic file for the epic being checked.
The product manager reads product/prd-call-reminders.txt and the epic file for the requirement being checked.
The designer reads design/call-reminders-review.txt and product/prd-call-reminders.txt.

issues/
The project manager uses this folder. dependencies.txt shows the order of the epics, the blockers, and which epic must finish before another starts. Each epic is one plain text file. The presenter stages from those files once. Most checks need both files.

product/
The product manager uses this folder. prd-call-reminders.txt is the product requirements document for call reminders on Grok Voice. project-update.txt is a draft for the project update. Most checks need the requirements document and an epic file.

design/
The designer uses this folder. call-reminders-review.txt covers the call flow, the call settings screen, and the transcript view on the invoice. Numbered decisions use DR (design review decision), starting at DR-1. Most checks need this note and the requirements document.

How to check the app
Go to http://localhost:43173. Go to an invoice page and the settings page. The app is the source for what the screen shows today. These docs do not change the app.

Scope of this pack
Stay inside payment reminders by phone call. Scheduling, scripts, consent, outcomes, retries, a results view, and a pay link are the topics in this pack. Do not add other product tracks to these files.
