# Standard bug fix (201 track)

Add from the local repository: **Customize → Plugins → Add → From Local Repository**, then choose this directory (`plugins/standard-bug-fix`).

Ships:

- Skill `/standard-bug-fix` — resolve the Linear project from chat (or ask the operator), then match the Fieldnote issue by **title** from `FIELD_DEMO_ISSUES` (example: `/standard-bug-fix Clicking Overdue or Needs review does not filter the queue`). Do not key off `LY-003`; on a `LY` team that identifier is the email story.
- Rule: Linear writeback for hypothesis, debug notes, and the fix PR
- Linear MCP at `https://mcp.linear.app/mcp` (authenticate after import)

Linear comments use the Bug Fix Summary template in the skill and rule.
