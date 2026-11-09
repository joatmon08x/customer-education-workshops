# Present the workshop

This page is for presenters. Attendees follow [`README.md`](README.md).

Stage Linear if the session uses it, start the app, then open the runbooks. Beat prompts and Do steps live on the canvas. Do not name a real customer, prospect, or company.

## Check setup

1. Confirm attendees can open [http://localhost:43173](http://localhost:43173). Install steps are in `README.md`.
2. In Grok Build, run `preflight-checker` for the track you are presenting. Fix anything it reports before you continue. Preflight does not start the app.

## Stage Linear

Do this before any beat that uses Linear, if the operator does not already have a team.

Linear MCP cannot create teams. Public and private teams are both valid. Public and private projects are both valid.

1. Open Linear → **Settings → Teams → New team**.
2. Name the team for this operator only. For example, `{displayName}-workshop`.
3. Leave it public, or turn on **Make team private**. The team key can be **LY**. Confirm it at `https://linear.app/<workspace>/settings/teams/LY`.
4. If the team is private, members are only you.
5. Run `stage-linear` and confirm the exact team before it writes. The project stays public unless you ask for private.

`stage-linear` never guesses the team. The next stage reopens the project and reopens recorded issues to `Todo`. It creates a title only when the title is missing, or when a canceled issue will not leave `Canceled`. `reset-demo-state` uses the same confirmation, then cancels the recorded issues and cancels the project. Issues stay linked. The team stays for the next run.

A public project on that team is valid. `stage-linear` does not refuse it or force it private.

## Start the app

Run `start-ledgerly`. The skill starts the server on port 43173, seeds only when the database is empty, opens the app, and opens the Runbooks canvas.

Do not use `start-ledgerly` as a substitute for preflight.

## Open and use the runbooks

If the canvas is not already open, run `present-runbooks`. `runbooks.html` is a fallback if the canvas cannot open.

1. Select the track tab for this session.
2. If the track shows optional features, uncheck the ones you are skipping.
3. Copy the prompt on the current step.
4. Paste it in Grok Build.
5. Review the result before you go to the next step.

Do not read prompts aloud. State the intent, paste from the card, then say what changed.

## Reset

Run `npm run demo:reset` first. Complete only the MCP cleanup the script reports. Use `npm run db:reset` only to reload data.

Expected test output on a clean tree is in `README.md`. One failure is intentional.
