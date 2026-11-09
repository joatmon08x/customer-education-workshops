---
name: present-runbooks
description: Open the native Ledgerly Runbooks canvas (numbered steps, track tabs, optional-feature checkboxes, Copy). Use when the user asks to open the runbook, open the runbooks, show the runbooks, present, walk the workshop, open the runbooks canvas, or go prompt-by-prompt. Do not open runbooks.html for those requests.
---

# Present Runbooks

Open this canvas every time. Do not open `runbooks.html`. Do not start the app, seed, run preflight, or recap beats in chat.

## 1. Track

If the user did not name `101`, `201`, `301`, or `401`, ask which track and wait.

## 2. Copy and open the canvas

Read `~/.cursor/skills-cursor/canvas/SKILL.md`. Read `runbooks.canvas.tsx` from this app root and write it with the file tool onto the workspace canvases path (overwrite if it exists):

`/Users/<user>/.cursor/projects/<workspace>/canvases/runbooks.canvas.tsx`

Then open that file (`open_resource`). Do not hand-edit the generated file. Do not embed HTML. Do not open `runbooks.html`.

The canvas is native `cursor/canvas` UI:

- Catalog **tabs** for `101` / `201` / `301` / `401` (`useCanvasState` `runbooks-track`, default `"101"`)
- Numbered steps (`Step 1`, `Step 2`, …) in one scrolling list under section headings. Numbers skip unchecked optional steps.
- Optional-feature checkboxes on 301 (`runbooks-features`), on by default
- **Copy** on each prompt (`navigator.clipboard`)

Tell the user to click the named track tab, uncheck optional features they are skipping, and scroll to the next step. Copy pastes the prompt.

## 3. Do not

- Start the server, seed, or run `preflight-checker`. Those stay `start-ledgerly` and `preflight-checker`.
- Recap beats, paste `PRESENTER.md`, or add speaker notes in chat.
- Open `runbooks.html` or any other runbook view.
