---
name: choose-cursor-workflow
description: Walk the 101, 201, 301, or 401 Ledgerly track, then choose the mode, model, rule, or skill that fits the shape of the work. You still review the result.
---

# Walk the 101, 201, 301, or 401 track

The demo ships four jumpable tracks: **101**, **201**, **301**, and **401**. Every beat is independent. If the user names a beat, jump directly to it. You still review the result.

## The tracks

101 — You will explore different ways to work in Grok Build, use modes and models for the right tasks, apply rules and skills to ensure consistent quality, and complete at least one task with an agent.

201 — You will curate what belongs in an agent's context, encode conventions as project skills, connect a curated set of MCP servers, and split one task across parallel agents.

301: You will orchestrate work across agents, tasks, and coworkers: break tasks down for multiple agents, take a plan through parallel agents to a reviewable PR, scale review when several streams finish, and share ownership safely.

401 — You will rewrite a backlog issue so a Cloud Agent can finish it unattended, hand well-defined issues to parallel Cloud Agents, and direct a Project coordinator to plan and delegate larger work.

The beats live in `runbooks/meta.ts`, `runbooks.html`, and `runbooks.canvas.tsx`. When asked to open the runbook, run `present-runbooks` (click **301** for that track). `start-ledgerly` starts the app and opens the same numbered-steps canvas. Do not open `runbooks.html` for those requests; it is a fallback if the canvas cannot open. Optional features are checkboxes, checked by default. Uncheck a feature to hide its beats. The choice is saved in the canvas. Use the matching `example` verbatim. Do not invent another catalog price.

The named demo error is `dsp_1043` / the suggested-credit v1 client. Do not mention the invoice or dispute filter-pill `state=` seam unless the user is on that click path.

Before a demo session, run `preflight-checker` with the track id (`preflight-checker track 101`, `201`, `301`, or `401`). It reports **Ready** when every required check for that track passed, and it does not install, seed, start the server, or stage Linear. If the track is missing, it asks which of `101`, `201`, `301`, or `401` and runs no checks. Then start the session with `npm run demo:session -- start`. Record every rule, skill, Canvas, Figma deck, Linear board, and demo branch it creates. Reset is script-first and clears every track at once; update the event record and reset script whenever a beat gains a new leftover.

## 101 sections and beats

Before the session, run `preflight-checker` with the track id (`preflight-checker track 101`).

1. **What is Grok Build?** — Ask, Plan, Build in Agent mode, Debug, check the models, plan to fix the bug.
2. **How do you work with an agent?** — Run Mode allowlist, verify the email feature, redact, stop, interrupt and steer, continue to the end, review diffs, restore from a checkpoint.
3. **How do you govern an agent?** — create a user rule, test the rule, create a user skill, test the skill, Canvas, MCP / Figma.

## 201 sections and beats

Before the session, run `preflight-checker` with the track id (`preflight-checker track 201`).

1. **How do you manage context?** Rename agents, Ask DDD, check each agent's context window, ask across chats.
2. **How do you standardize agents?** Personal create-api skill, promote it.
3. **How do you connect external tools?** Linear MCP, MCP allowlist, list open issues from the issue tracker, add `plugins/standard-bug-fix` from the local repository, enable the Standard bug fix plugin (skills, rules, MCP server), standard bug fix on the overdue filter. The operator uses a public or private Linear team and project. Public and private projects are both valid. Linear MCP cannot create teams (Settings → Teams → New team; **Make team private** is optional). `stage-linear` accepts a public project and does not force it private. Then run `stage-linear`. `.cursor/mcp.json` has no project servers and there is no `mcp/` directory. Do not stand up a SQLite MCP.
4. **How do you parallelize a task?** — open a new agent, resolve-dispute plan, ledgerly-reviewer, dispatch-subagents skill, `/multitask`, Canvas subagent progress, ledgerly-reviewer check.

## 301 sections and beats

Before the session, run `preflight-checker` with the track id (`preflight-checker track 301`).

1. **How do you orchestrate agents?** Open a local agent, create accessibility-manual-reviewer, point the subagent at a faster cost-efficient model, optionally move to a Cloud Agent, `/multitask` the audit, and watch the Working tab.
2. **How do you go from plan to code?** Optionally start and stage a Project, list open collections issues, plan and build, use `/side`, consolidate into a PR, and fall back to repo issue descriptions if Linear MCP is unavailable.
3. **How do you scale review?** Open the feature branch, run the change reviewer subagent, check high severity issues, optionally run Bugbot, and read the highest-risk slice.
4. **How do you share ownership safely?** Shift review findings into a rule, skill, test, subagent, or a person, optionally create a Reviewer automation, and list files that might conflict.

## 401 sections and beats

Before the session, run `preflight-checker` with the track id (`preflight-checker track 401`).

1. **What tasks do you delegate?** Rewrite the dispute cap issue for unattended Cloud Agents, sort the backlog, and keep one issue synchronous.
2. **How do you delegate asynchronous work?** Check the cloud environment, launch three Cloud Agents in parallel, check them on the web, and review the finished PR.
3. **How do you direct larger work?** Start a Project, hand the coordinator the collections command center, review and build the plan, then track progress and shared context.

## Choose the mode

- **Ask** reads and explains; it does not edit. Use it to orient before touching code.
- **Plan** maps an approach before implementation.
- **Agent** is the default; it inspects, edits, and runs checks within the boundary you give it.
- **Debug** verifies a change and investigates failures.

## Choose the model

Use a high-reasoning model to plan and coordinate, and a faster model for narrow, well-scoped edits. On Teams and Enterprise, Auto (Grok Build Router) classifies each request for you. Pin a model when the role is already known.

## What does not change

The human reviews the result and decides what ships. Modes and models change how the work runs, not who is accountable.
