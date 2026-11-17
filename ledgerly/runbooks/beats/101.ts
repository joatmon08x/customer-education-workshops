import type { DemoSection } from "@/runbooks/types";

export const RUNBOOK_SECTIONS_101 = [
  {
    id: "first-prompt",
    title: "What is Grok Build?",
    beats: [
      {
        id: "ask",
        title: "Ask",
        promptType: "reusable",
        say: "Let's learn more about the application with Ask mode.",
        detail: "",
        example: "/ask Tell me what this application does in 3 sentences",
      },
      {
        id: "plan",
        title: "Plan",
        promptType: "adaptable",
        say: "Map your approach to building a new feature in Plan mode.",
        detail: "",
        example:
          "/plan I want a new feature to update the customer email in the invoice detail customer card. Don't implement email validation.",
      },
      {
        id: "agent-build",
        title: "Build in Agent mode",
        promptType: "none",
        say: "Build the feature in Agent mode.",
        detail: "Build the plan locally. Check the feature in the UI.",
      },
      {
        id: "debug",
        title: "Debug",
        promptType: "reusable",
        say: "Investigate the failing test using Debug mode.\nDebug mode is useful because the agent investigates the codebase and presents some hypothesis on the root cause.\nI can choose to reproduce the bug and attempt to fix based on the agent's hypotheses.",
        detail: "",
        example: "/debug the failing test",
      },
      {
        id: "model-fast",
        title: "Check the models",
        promptType: "none",
        say: "Check the models available for use.",
        detail: "Select Auto in the chat and review the models available for use.",
      },
      {
        id: "fix",
        title: "Plan to fix the bug",
        promptType: "adaptable",
        detail: "Use shift-tab to toggle to Agent mode.",
        example: "Fix the failing test.",
      },
    ],
  },
  {
    id: "work-with-agent",
    title: "How do you work with an agent?",
    beats: [
      {
        id: "allowlist",
        title: "Run Mode Allowlist",
        promptType: "none",
        say: "Let's change how our agent asks for approvals by configuring an allowlist - a known set of commands that Grok Build can run without asking for review.",
        detail: "Go to Settings > Agents > Executions & Approvals > Run Mode > Allowlist.",
      },
      {
        id: "verify-email",
        title: "Verify the email feature",
        promptType: "none",
        detail:
          "Go to http://localhost:43173/invoices/inv_1048.\nFind the edit email feature you implemented in the Customer box.",
      },
      {
        id: "start-and-stop",
        title: "Redact (partial)",
        promptType: "adaptable",
        detail: "",
        example:
          "Redact the customer email in the UI. The first two characters and domain are plaintext. When I click to type in the box, clear it and save the new email.",
      },
      {
        id: "stop",
        title: "Stop the prompt",
        promptType: "none",
        detail: "Stop the prompt with the Stop button in the chat.",
      },
      {
        id: "interrupt-steer",
        title: "Interrupt and steer",
        promptType: "adaptable",
        say: "Steer the prompt.",
        detail: "Show how the agent pauses for your approval. Continue running after reviewing the first file.",
        example:
          "Redact the customer email in the UI. Show it in plaintext when I click the box to edit it. Stop every time you change a file for me to review.",
      },
      {
        id: "continue-no-approval",
        title: "Continue to the end",
        promptType: "adaptable",
        detail: "",
        example: "Continue to the end, do not wait for my approval.",
      },
      {
        id: "diffs",
        title: "Review diffs",
        promptType: "none",
        detail: "Select Changes in the right hand panel. Show diffs from agent's last turn.",
      },
      {
        id: "checkpoint-restore",
        title: "Restore from a checkpoint",
        promptType: "none",
        say: "If I want to revert the code, I can restore from a checkpoint.",
        detail: "Scroll back to a prompt before updating the feature. Select the restore icon next to the prompt.",
      },
    ],
  },
  {
    id: "govern-agent",
    title: "How do you govern an agent?",
    beats: [
      {
        id: "rule",
        title: "Create a user rule",
        promptType: "adaptable",
        say: "Let's create a user rule so the agent doesn't try to improve the invoice UI without our approval.\nUse /create-rule, a built-in skill, to create a rule.",
        detail: "Go to Customize > Rules > User to view the rule.",
        example:
          "/create-rule Preserve the invoice view. Do not rename, restyle, or rearrange invoice screens unless the user names the **exact** new copy (or a specific layout change). This is a personal rule.",
      },
      {
        id: "test-rule",
        title: "Test the rule",
        promptType: "adaptable",
        detail: "",
        example: 'Change "Line Items" in the UI to something else.',
      },
      {
        id: "skill",
        title: "Create a user skill",
        promptType: "adaptable",
        say: "Let's create a user skill that tells me the domain breakdown and available APIs.",
        detail: "Go to Customize > Skills to view the skill.",
        example:
          "/create-skill Use domain-driven design to break down the domains in this application and match it to available APIs or data schemas. This is a personal skill.",
      },
      {
        id: "test-skill",
        title: "Test the skill",
        promptType: "adaptable",
        detail: "",
        example: "Use domain-driven design on this application. Do not edit files.",
      },
      {
        id: "canvas",
        title: "Canvas",
        promptType: "reusable",
        say: "Use Canvas to generate interactive artifacts that render next to the chat.",
        detail: "",
        example: "Create a canvas explaining the feature we built.",
      },
      {
        id: "mcp",
        title: "MCP / Linear",
        promptType: "reusable",
        say: "Ask Grok Build to create a 15-second video and post it to an issue.",
        detail: "Go to Customize > MCPs > Linear.",
        example:
          "Create a Linear issue for this feature. Attach a 15-second video, made from the canvas, summarizing how we built it.",
      },
    ],
  },
] as const satisfies readonly DemoSection[];
