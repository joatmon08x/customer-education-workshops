import {
  Button,
  Card,
  CardBody,
  Checkbox,
  H1,
  H2,
  Row,
  Stack,
  Text,
  useCanvasState,
  useHostTheme,
  useState,
} from "cursor/canvas";

type TrackId = "101" | "201" | "301" | "401";
type Block =
  | { kind: "say"; text: string }
  | { kind: "steps"; lines: string[] }
  | { kind: "prompt"; text: string; label: string };
type Beat = { id: string; title: string; feature?: string; blocks: Block[] };
type NumberedBeat = Beat & { number: number };
type Section = { id: string; title: string; beats: Beat[] };
type NumberedSection = { id: string; title: string; beats: NumberedBeat[] };
type Track = {
  id: TrackId;
  title: string;
  description: string;
  features: string[];
  sections: Section[];
};
type FeatureMap = Record<string, Record<string, boolean>>;

const TRACKS: Track[] = [
  {
    "id": "101",
    "title": "101",
    "description": "You will explore different ways to work in Grok Build, use modes and models for the right tasks, apply rules and skills to ensure consistent quality, and complete at least one task with an agent.",
    "features": [],
    "sections": [
      {
        "id": "first-prompt",
        "title": "What is Grok Build?",
        "beats": [
          {
            "id": "ask",
            "title": "Ask",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Let’s learn more about the application with Ask mode."
                ]
              },
              {
                "kind": "prompt",
                "text": "/ask Tell me what this application does in 3 sentences",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "plan",
            "title": "Plan",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Map your approach to building a new feature in Plan mode."
                ]
              },
              {
                "kind": "prompt",
                "text": "/plan I want a new feature to update the customer email in the invoice detail customer card. Don’t implement email validation.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "agent-build",
            "title": "Build in Agent mode",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Build the feature in Agent mode. Build the plan locally. Check the feature in the UI."
                ]
              }
            ]
          },
          {
            "id": "debug",
            "title": "Debug",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Investigate the failing test using Debug mode. Debug mode is useful because the agent investigates the codebase and presents some hypothesis on the root cause. I can choose to reproduce the bug and attempt to fix based on the agent’s hypotheses."
                ]
              },
              {
                "kind": "prompt",
                "text": "/debug the failing test",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "model-fast",
            "title": "Check the models",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Check the models available for use. Select Auto in the chat and review the models available for use."
                ]
              }
            ]
          },
          {
            "id": "fix",
            "title": "Plan to fix the bug",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Use shift-tab to toggle to Agent mode."
                ]
              },
              {
                "kind": "prompt",
                "text": "Fix the failing test.",
                "label": "Paste in Grok Build"
              }
            ]
          }
        ]
      },
      {
        "id": "work-with-agent",
        "title": "How do you work with an agent?",
        "beats": [
          {
            "id": "allowlist",
            "title": "Run Mode Allowlist",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Let’s change how our agent asks for approvals by configuring an allowlist - a known set of commands that Grok Build can run without asking for review. Go to Settings > Agents > Executions & Approvals > Run Mode > Allowlist."
                ]
              }
            ]
          },
          {
            "id": "verify-email",
            "title": "Verify the email feature",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Go to http://localhost:43173/invoices/inv_1048. Find the edit email feature you implemented in the Customer box."
                ]
              }
            ]
          },
          {
            "id": "start-and-stop",
            "title": "Redact (partial)",
            "blocks": [
              {
                "kind": "prompt",
                "text": "Redact the customer email in the UI. The first two characters and domain are plaintext. When I click to type in the box, clear it and save the new email.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "stop",
            "title": "Stop the prompt",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Stop the prompt with the Stop button in the chat."
                ]
              }
            ]
          },
          {
            "id": "interrupt-steer",
            "title": "Interrupt and steer",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Steer the prompt. Show how the agent pauses for your approval. Continue running after reviewing the first file."
                ]
              },
              {
                "kind": "prompt",
                "text": "Redact the customer email in the UI. Show it in plaintext when I click the box to edit it. Stop every time you change a file for me to review.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "continue-no-approval",
            "title": "Continue to the end",
            "blocks": [
              {
                "kind": "prompt",
                "text": "Continue to the end, do not wait for my approval.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "diffs",
            "title": "Review diffs",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Select Changes in the right hand panel. Show diffs from agent’s last turn."
                ]
              }
            ]
          },
          {
            "id": "checkpoint-restore",
            "title": "Restore from a checkpoint",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "If I want to revert the code, I can restore from a checkpoint. Scroll back to a prompt before updating the feature. Select the restore icon next to the prompt."
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "govern-agent",
        "title": "How do you govern an agent?",
        "beats": [
          {
            "id": "rule",
            "title": "Create a user rule",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Let’s create a user rule so the agent doesn’t try to improve the invoice UI without our approval. Use /create-rule, a built-in skill, to create a rule. Go to Customize > Rules > User to view the rule."
                ]
              },
              {
                "kind": "prompt",
                "text": "/create-rule Preserve the invoice view. Do not rename, restyle, or rearrange invoice screens unless the user names the **exact** new copy (or a specific layout change). This is a personal rule.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "test-rule",
            "title": "Test the rule",
            "blocks": [
              {
                "kind": "prompt",
                "text": "Change \"Line Items\" in the UI to something else.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "skill",
            "title": "Create a user skill",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Let’s create a user skill that tells me the domain breakdown and available APIs. Go to Customize > Skills to view the skill."
                ]
              },
              {
                "kind": "prompt",
                "text": "/create-skill Use domain-driven design to break down the domains in this application and match it to available APIs or data schemas. This is a personal skill.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "test-skill",
            "title": "Test the skill",
            "blocks": [
              {
                "kind": "prompt",
                "text": "Use domain-driven design on this application. Do not edit files.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "canvas",
            "title": "Canvas",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Use Canvas to generate interactive artifacts that render next to the chat."
                ]
              },
              {
                "kind": "prompt",
                "text": "Create a canvas explaining what we did today.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "mcp",
            "title": "MCP / Figma",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Ask Grok Build to create a slideshow in Figma using MCP Servers. Find an MCP server for slideshow generation in Grok Build. Go to Customize > MCPs > Figma."
                ]
              },
              {
                "kind": "prompt",
                "text": "Create three slides in Figma Slides outlining how I used Grok Build to develop a new feature. I want to use this as part of my demo showcase.",
                "label": "Paste in Grok Build"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "201",
    "title": "201",
    "description": "You will curate what belongs in an agent's context, encode conventions as project skills, connect a curated set of MCP servers, and split one task across parallel agents.",
    "features": [],
    "sections": [
      {
        "id": "target-context",
        "title": "How do you manage context?",
        "beats": [
          {
            "id": "rename-agent-1-all",
            "title": "Open one agent and ask it for information about the entire codebase.",
            "blocks": [
              {
                "kind": "prompt",
                "text": "/rename-chat Agent 1 All",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "ask-ddd-all",
            "title": "Ask DDD of the application",
            "blocks": [
              {
                "kind": "prompt",
                "text": "/ask what is the domain driven design of the application.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "rename-agent-2-target",
            "title": "Let’s open a second agent. This starts a new context window.",
            "blocks": [
              {
                "kind": "prompt",
                "text": "/rename-chat Agent 2 Target",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "ask-ddd-invoice-table",
            "title": "Ask DDD of the invoice table",
            "blocks": [
              {
                "kind": "prompt",
                "text": "/ask what is the domain driven design of the @invoice-table.tsx",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "context-usage",
            "title": "Check agent 1’s context window.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Go to Agent 1 All chat. Click the Context Usage indicator below the chat. Agent 1 maps all the domains in the whole codebase. Its context window shows X%."
                ]
              }
            ]
          },
          {
            "id": "compare-agents",
            "title": "Check agent 2’s context window.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Go to Agent 2 Target. Click the Context Usage indicator below the chat. Agent 2 maps half of the domains based on the targeted context. Its context window shows Y%. The difference in context window may not be significant but can affect larger repositories."
                ]
              }
            ]
          },
          {
            "id": "ask-cross-context",
            "title": "We want to check if the invoice table can be changed in isolation.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Agent 1 did the work of identifying all domains. Agent 2 can benefit from its summary. It doesn’t need to review the entire codebase again. Go to Agent 2 Target chat."
                ]
              },
              {
                "kind": "prompt",
                "text": "/ask @Agent 1 All Does refactoring the table change anything across all contexts?",
                "label": "Paste in Grok Build"
              }
            ]
          }
        ]
      },
      {
        "id": "standardize-agents",
        "title": "How do you standardize agents?",
        "beats": [
          {
            "id": "create-api-personal-skill",
            "title": "Open a new agent and add a new personal skill.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Open a new agent. Every time I ask a new agent to create an API, it forgets how to do it and scans the entire repository for the pattern. Let’s create a skill for it so the agent can do less work. Open skill in ~/.cursor/skills."
                ]
              },
              {
                "kind": "prompt",
                "text": "/create-skill for how to create a new API. Follow the standards in this repo. This is a personal skill named create-api.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "promote-create-api-project",
            "title": "Create a project skill.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "A teammate mentioned they were frustrated because they had to keep correcting the agent when it builds the API. They asked if they could also use the API skill.",
                  "Open skill in .cursor/skills",
                  "Review the other project skills for this repository, such as add-dashboard-widget, draft-collection-email, or write-prisma-query."
                ]
              },
              {
                "kind": "prompt",
                "text": "Promote the create-api skill to this project.",
                "label": "Paste in Grok Build"
              }
            ]
          }
        ]
      },
      {
        "id": "mcp-more-info",
        "title": "How do you connect external tools?",
        "beats": [
          {
            "id": "add-linear-mcp",
            "title": "Start the MCP server for the company issue tracker.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Let’s start the issue tracker’s MCP server. For this workshop, that is Linear. Get a ticket for this project.",
                  "Review MCP servers in Customize > MCPs",
                  "Enable the Linear MCP server."
                ]
              }
            ]
          },
          {
            "id": "mcp-allowlist",
            "title": "Check your allowed MCP servers.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Go to Settings > Agents > Execution and Approvals > Allowlist Options > MCP Allowlist to check valid MCP servers and tools from your administrator."
                ]
              }
            ]
          },
          {
            "id": "start-issue-agent",
            "title": "Start a new agent.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Open a new agent. Someone reported a bug and it was logged in our issue tracker. I want more information on it."
                ]
              }
            ]
          },
          {
            "id": "ask-linear-bug",
            "title": "Retrieve a bug ticket from the issue tracker.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Review the tool calls to the Linear MCP server."
                ]
              },
              {
                "kind": "prompt",
                "text": "List the open issues from our issue tracker.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "add-local-plugin",
            "title": "Add the plugin.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "My teammate on another application let me know that they just created a plugin for standardizing and documenting bug fixes on our issue tracker. Go to Customize > Plugins > Add > From Local Repository. Find the plugins/standard-bug-fix file directory and add it."
                ]
              }
            ]
          },
          {
            "id": "check-plugin",
            "title": "Enable the “Standard bug fix” plugin.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Go to Customize > Plugins. Go to Personal. Click Add to enable the “Standard bug fix” plugin. Show that the plugin has skills, rules, and MCP server."
                ]
              }
            ]
          },
          {
            "id": "standard-bug-fix",
            "title": "Fix the bug with the standard template.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Let’s fix the bug and update the issue with the standard template. Go to the issue in Linear and review the comments following the bug template."
                ]
              },
              {
                "kind": "prompt",
                "text": "Work on a standard bug fix for the issue where clicking overdue does not filter.",
                "label": "Paste in Grok Build"
              }
            ]
          }
        ]
      },
      {
        "id": "parallelize-task",
        "title": "How do you parallelize a task?",
        "beats": [
          {
            "id": "open-new-agent",
            "title": "Start a new agent.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Open a new agent. I created a plan for a feature to resolve disputes, splitting the work across three agents."
                ]
              }
            ]
          },
          {
            "id": "open-resolve-dispute-plan",
            "title": "Split the plan for three parallel agents.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Open .cursor/plans/resolve-dispute.md. Review the plan and how it splits data, API, and UI tasks."
                ]
              }
            ]
          },
          {
            "id": "open-ledgerly-reviewer",
            "title": "The plan uses custom subagents to control how changes are made.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "For any changes to the application, there is a reviewer subagent to check changes.",
                  "Open .cursor/agents/ledgerly-reviewer.md"
                ]
              }
            ]
          },
          {
            "id": "open-dispatch-subagents-skill",
            "title": "The plan has concrete steps for conflict resolution.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Open .cursor/skills/dispatch-subagents/SKILL.md. This skill gives clear guidance to your agents that they should avoid making changes with conflicts."
                ]
              }
            ]
          },
          {
            "id": "multitask-resolve-dispute",
            "title": "Start multitasking.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Build the feature using the /multitask command."
                ]
              },
              {
                "kind": "prompt",
                "text": "/multitask @resolve-dispute.md",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "canvas-subagent-progress",
            "title": "Show the progress of subagents and tasks.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Use Canvas to keep track of the progress of subagents and their tasks. Review Canvas with subagent progress and worktree conflicts."
                ]
              },
              {
                "kind": "prompt",
                "text": "Update Canvas with subagent progress and models used. Make a list of worktree conflicts as you encounter them.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "ledgerly-reviewer-check",
            "title": "Verify the task completed with the subagent.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Use the specialized reviewer subagent to check the completed task."
                ]
              },
              {
                "kind": "prompt",
                "text": "ledgerly-reviewer check my work",
                "label": "Paste in Grok Build"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "301",
    "title": "301",
    "description": "You will orchestrate work across agents, tasks, and coworkers: break tasks down for multiple agents, take a plan through parallel agents to a reviewable PR, scale review when several streams finish, and share ownership safely.",
    "features": [
      "Cloud Agents",
      "Projects",
      "Bugbot",
      "Automations"
    ],
    "sections": [
      {
        "id": "orchestrate-agents",
        "title": "How do you orchestrate agents?",
        "beats": [
          {
            "id": "optional-cloud-command-center",
            "title": "Plan the command center on a Cloud Agent.",
            "feature": "Cloud Agents",
            "blocks": [
              {
                "kind": "say",
                "text": "This plan runs on a remote machine, so it keeps going while I do the keyboard walkthrough locally."
              },
              {
                "kind": "steps",
                "lines": [
                  "Start a new Cloud Agent."
                ]
              },
              {
                "kind": "prompt",
                "text": "/plan the collections command center from its open Linear issues. List the tasks, the files each touches, and the open questions.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "get-command-center-issues",
            "title": "Get the issues for the collections command center from the issue tracker.",
            "blocks": [
              {
                "kind": "say",
                "text": "The Linear MCP server returns a list of nine issues to create the collections command center."
              },
              {
                "kind": "steps",
                "lines": [
                  "Start a new local agent."
                ]
              },
              {
                "kind": "prompt",
                "text": "/ask List open issues for the collections command center in Linear.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "plan-command-center",
            "title": "Plan the collections command center in a separate agent.",
            "blocks": [
              {
                "kind": "say",
                "text": "We are going to run this first and handle the manual part in parallel. This agent only plans. It builds nothing until we come back to it."
              },
              {
                "kind": "prompt",
                "text": "/plan the collections command center from its issues. List the tasks, the files each touches, and the open questions.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "open-local-agent",
            "title": "Start a keyboard walkthrough for the accessibility audit in a new agent.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Start a new local agent for the keyboard walkthrough."
                ]
              }
            ]
          },
          {
            "id": "show-problem-by-hand",
            "title": "Show the problem by hand.",
            "blocks": [
              {
                "kind": "say",
                "text": "Focus is the control the keyboard is on right now. When you press Tab, focus moves to the next button, link, or field. A visible outline usually shows where it is, so a keyboard user always knows what Enter will do.\nPressing Tab repeatedly is a slow manual process. Is there a way we can automate this?"
              },
              {
                "kind": "steps",
                "lines": [
                  "Open Browser to http://localhost:43173/invoices.",
                  "Press Tab a few times on the invoices page."
                ]
              }
            ]
          },
          {
            "id": "create-accessibility-manual-reviewer",
            "title": "Build a subagent to help automate the manual process.",
            "blocks": [
              {
                "kind": "say",
                "text": "CI catches missing labels, which break screen readers, and low contrast, which makes text hard to read.\nA keyboard walkthrough takes judgment, so this subagent uses the page the way a keyboard user would. Reuse it any time you change the UI."
              },
              {
                "kind": "prompt",
                "text": "/create-subagent accessibility-manual-reviewer that walks pages by keyboard in the Browser, since CI runs automated tests. Report tab order, focus, trap, Escape, and navigation failures with screenshots. Set model: fast, readonly: false.",
                "label": "Paste in Grok Build"
              },
              {
                "kind": "steps",
                "lines": [
                  "npm run demo:session -- record project-path .cursor/agents/accessibility-manual-reviewer.md"
                ]
              }
            ]
          },
          {
            "id": "start-audit-agent",
            "title": "Start a new agent to audit accessibility.",
            "blocks": [
              {
                "kind": "say",
                "text": "A new agent keeps the audit separate from the command center plan."
              },
              {
                "kind": "steps",
                "lines": [
                  "Start a new local agent."
                ]
              }
            ]
          },
          {
            "id": "multitask-walkthroughs",
            "title": "Show /multitask for small coordinated jobs.",
            "blocks": [
              {
                "kind": "say",
                "text": "The coordinator gives each task its own subagent: a keyboard walkthrough of the invoices page, the accessibility test suite, and the application test suite."
              },
              {
                "kind": "steps",
                "lines": [
                  "Open Browser to http://localhost:43173/invoices."
                ]
              },
              {
                "kind": "prompt",
                "text": "/multitask Split into three subagents: accessibility-manual-reviewer checks @components/notice-bell.tsx on the invoices page (click, Tab once, Escape, stop at one failure), one runs accessibility tests, one runs app tests.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "review-subagents",
            "title": "Review the subagents.",
            "blocks": [
              {
                "kind": "say",
                "text": "Stop one task if it drifts. When each agent completes, you get a set of recommendations."
              },
              {
                "kind": "steps",
                "lines": [
                  "Watch the Working indicator above the chat box."
                ]
              }
            ]
          },
          {
            "id": "summarize-subagents",
            "title": "Check the output of the subagents.",
            "blocks": [
              {
                "kind": "say",
                "text": "The coordinator summarizes the failures from the keyboard walkthrough of the invoices page, the accessibility test suite, and the application test suite."
              },
              {
                "kind": "prompt",
                "text": "Give me a one-sentence summary for each subagent.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "linear-issue-fallback",
            "title": "Fallback: reference repo issues",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "If an agent cannot access the Linear MCP server, use the issue descriptions in the repository."
                ]
              },
              {
                "kind": "prompt",
                "text": "Reference issues from @runbooks/linear-field-demos.ts instead of Linear.",
                "label": "Paste in Grok Build"
              }
            ]
          }
        ]
      },
      {
        "id": "plan-to-code",
        "title": "How do you go from plan to code?",
        "beats": [
          {
            "id": "optional-start-project",
            "title": "Start a new Project.",
            "feature": "Projects",
            "blocks": [
              {
                "kind": "say",
                "text": "Starting a new Project creates a long-running Cloud Agent that acts as a coordinator.\nRun the remaining commands in the Project. Note that responses to prompts may differ from responses in an individual agent."
              },
              {
                "kind": "steps",
                "lines": [
                  "Start a new Project.",
                  "Name it {{ INSERT COMPANY HERE, default is Ledgerly }}."
                ]
              }
            ]
          },
          {
            "id": "optional-stage-project",
            "title": "Stage the Project.",
            "feature": "Projects",
            "blocks": [
              {
                "kind": "say",
                "text": "Make clear to the Project that each agent runs in its own worktree to isolate work and avoid conflicts."
              },
              {
                "kind": "prompt",
                "text": "Run each agent in its own worktree to avoid conflicts, and parallelize where possible.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "optional-assign-project",
            "title": "Use Projects to assign tasks to agents.",
            "feature": "Projects",
            "blocks": [
              {
                "kind": "say",
                "text": "Let Projects decide how best to assign tasks and complete work."
              },
              {
                "kind": "steps",
                "lines": [
                  "Run the remaining prompts in this demo section from the Project without starting new agents."
                ]
              }
            ]
          },
          {
            "id": "open-plan-agent",
            "title": "Start a new agent.",
            "blocks": [
              {
                "kind": "say",
                "text": "I want to fix the keyboard findings that do not share a file."
              },
              {
                "kind": "steps",
                "lines": [
                  "Open a new local agent."
                ]
              }
            ]
          },
          {
            "id": "plan-remediation",
            "title": "Start a plan to fix the walkthrough failures on a separate worktree.",
            "blocks": [
              {
                "kind": "say",
                "text": "Plan the in-scope findings, one task per finding, each on its own worktree. If the plan asks questions, choose to run tasks in parallel and write updates to the issue tracker.\nBy starting the work on a separate worktree, you avoid editing the working code on the main branch. If you do not let the agent automatically approve changes on the worktree, you may have to manually approve each file change."
              },
              {
                "kind": "prompt",
                "text": "/plan the in-scope keyboard fixes in @.cursor/plans/keyboard-walkthrough-audit.md. One task per finding, in parallel, each on its own worktree with auto-approved changes.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "review-plan",
            "title": "Review the plan.",
            "blocks": [
              {
                "kind": "say",
                "text": "The plan assigns tasks to workers and notes which ones run in parallel."
              },
              {
                "kind": "steps",
                "lines": [
                  "Review the plan."
                ]
              }
            ]
          },
          {
            "id": "build-plan",
            "title": "Build the plan.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Click Build Locally."
                ]
              }
            ]
          },
          {
            "id": "optional-build-cloud",
            "title": "Use Cloud Agents to build the plan if you do not have Projects.",
            "feature": "Cloud Agents",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Build the plan with Cloud Agents."
                ]
              }
            ]
          },
          {
            "id": "side-chat",
            "title": "Ask a side question while the coordinator remediates the findings.",
            "blocks": [
              {
                "kind": "prompt",
                "text": "/side",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "ask-subagent-progress",
            "title": "Ask what the first subagent is remediating.",
            "blocks": [
              {
                "kind": "say",
                "text": "If you want to know what a subagent is doing, you can open a side chat and ask without blocking the coordinator."
              },
              {
                "kind": "prompt",
                "text": "/ask What is the first subagent remediating? Answer with the finding and the files it changes.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "consolidate-pr",
            "title": "Consolidate and open a reviewable PR.",
            "blocks": [
              {
                "kind": "say",
                "text": "Move finished worktrees back deliberately. Resolve conflicts on purpose."
              },
              {
                "kind": "steps",
                "lines": [
                  "Open the PR. Show the summary a coworker would read first."
                ]
              },
              {
                "kind": "prompt",
                "text": "Consolidate the completed tasks into one branch so reviewers get one PR. Open a PR with what each task changed and what a human should verify.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "optional-project-notes",
            "title": "Keep track of the Project.",
            "feature": "Projects",
            "blocks": [
              {
                "kind": "say",
                "text": "As you continue working on the Project, it keeps track of your requests to agents.\nYou can review tasks in project notes and shared files in context."
              },
              {
                "kind": "prompt",
                "text": "Show me the project notes and context.",
                "label": "Paste in Grok Build"
              }
            ]
          }
        ]
      },
      {
        "id": "scale-review",
        "title": "How do you scale review?",
        "beats": [
          {
            "id": "checkout-fixes-branch",
            "title": "Start a new agent.",
            "blocks": [
              {
                "kind": "say",
                "text": "With many lines of accessibility fixes in this PR, I want to identify the most important files to review."
              },
              {
                "kind": "steps",
                "lines": [
                  "Open a new local agent."
                ]
              },
              {
                "kind": "prompt",
                "text": "Check out the branch for the keyboard fixes PR.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "run-reviewer-subagent",
            "title": "Run the change reviewer subagent before you conduct manual review.",
            "blocks": [
              {
                "kind": "say",
                "text": "The change reviewer uses readonly: false so it can run git diff, but its instructions stop it from editing files. The reviewer and the author stay separate."
              },
              {
                "kind": "prompt",
                "text": "Use the change reviewer subagent to review the remediation PR. List each issue with its file, line, and severity.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "check-closer-inspection",
            "title": "Identify any changes requiring closer inspection.",
            "blocks": [
              {
                "kind": "say",
                "text": "The plan includes a step that sounds reasonable but blocks Tab navigation everywhere. The change reviewer flags it as high severity, with the file and line, so we never keep it."
              },
              {
                "kind": "steps",
                "lines": [
                  "Check the change reviewer’s output for any issues requiring closer inspection."
                ]
              },
              {
                "kind": "prompt",
                "text": "Fix the findings from the change reviewer.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "review-highest-risk",
            "title": "Review the high-risk changes.",
            "blocks": [
              {
                "kind": "say",
                "text": "The change reviewer subagent clears the noise so your time goes where judgment matters."
              },
              {
                "kind": "steps",
                "lines": [
                  "Open the highest-risk change and read it line by line."
                ]
              },
              {
                "kind": "prompt",
                "text": "/ask Which change in this PR has the highest risk? List the files and lines I need to review.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "optional-bugbot",
            "title": "Run Bugbot.",
            "feature": "Bugbot",
            "blocks": [
              {
                "kind": "say",
                "text": "Run Bugbot to check for code quality. Review its suggestions for changes."
              },
              {
                "kind": "prompt",
                "text": "/review-bugbot this remediation PR",
                "label": "Paste in Grok Build"
              }
            ]
          }
        ]
      },
      {
        "id": "share-ownership",
        "title": "How do you share ownership safely?",
        "beats": [
          {
            "id": "open-ownership-agent",
            "title": "Start a new agent.",
            "blocks": [
              {
                "kind": "say",
                "text": "I want to turn some of the review findings in this PR into the most reliable fix: a rule, skill, subagent, test, or human check."
              },
              {
                "kind": "steps",
                "lines": [
                  "Open a new local agent."
                ]
              }
            ]
          },
          {
            "id": "shift-left-findings",
            "title": "Identify the most reliable fix for each review finding.",
            "blocks": [
              {
                "kind": "say",
                "text": "You choose which ones to turn into a rule, skill, subagent, test, or human check for your coworkers to reuse."
              },
              {
                "kind": "prompt",
                "text": "Turn repeat findings from this PR's review comments and change reviewer into reusable fixes so they stop recurring. Draft the most deterministic fix for each: a rule, skill, subagent, test, or human check.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "optional-reviewer-automation",
            "title": "Create an Automation.",
            "feature": "Automations",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Go to the Automations tab.",
                  "Click New Automation.",
                  "Name it Reviewer.",
                  "Select the demo repository.",
                  "Click Triggers > PR opened, then select the demo repository and set the author to Anyone.",
                  "Add “Use the change reviewer subagent to review this PR and comment with each issue's file, line, and severity.” to agent instructions.",
                  "Add “Comment on Pull Request” to tools.",
                  "Click Save."
                ]
              }
            ]
          },
          {
            "id": "optional-trigger-automation",
            "title": "Trigger the PR Automation.",
            "feature": "Automations",
            "blocks": [
              {
                "kind": "say",
                "text": "Opening any PR triggers the Reviewer Automation, so I'll create one and watch the check run."
              },
              {
                "kind": "steps",
                "lines": [
                  "Start a new local agent.",
                  "Open the PR for the accessibility test suite fixes and review the status check for Automation: Reviewer."
                ]
              },
              {
                "kind": "prompt",
                "text": "Run the accessibility test suite and fix its failures on a separate worktree. Open a PR when done.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "return-to-plan",
            "title": "Return to the collections command center plan.",
            "blocks": [
              {
                "kind": "say",
                "text": "Now I’m going back to the collections command center plan. Before I start the work, I’ll check the keyboard fixes PR for conflicts."
              },
              {
                "kind": "steps",
                "lines": [
                  "Open the command center planning agent in the Agent Window. Don’t start a new plan."
                ]
              }
            ]
          },
          {
            "id": "optional-cloud-return",
            "title": "Instead, open the command center planning agent from the Cloud Agents list.",
            "feature": "Cloud Agents",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Instead, open the command center planning agent from the Cloud Agents list."
                ]
              }
            ]
          },
          {
            "id": "list-conflict-files",
            "title": "Check other PRs for files and comments that conflict with the next project.",
            "blocks": [
              {
                "kind": "say",
                "text": "Use the context in other PRs to identify possible conflicts before you start work."
              },
              {
                "kind": "prompt",
                "text": "Review the open PRs in this repository and flag any that have file conflicts or comments that may affect the collections command center feature.",
                "label": "Paste in Grok Build"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "401",
    "title": "401",
    "description": "You will rewrite a backlog issue so a Cloud Agent can finish it unattended, hand well-defined issues to parallel Cloud Agents, and direct a Project coordinator to plan and delegate larger work.",
    "features": [],
    "sections": [
      {
        "id": "what-tasks-do-you-delegate",
        "title": "What tasks do you delegate?",
        "beats": [
          {
            "id": "rewrite-dispute-cap",
            "title": "Rewrite an issue so an agent can finish it unattended.",
            "blocks": [
              {
                "kind": "say",
                "text": "Before I hand work to Cloud Agents, I need to rewrite an issue so an agent can finish it unattended."
              },
              {
                "kind": "steps",
                "lines": [
                  "Go to the Agents Window and start a new local agent."
                ]
              },
              {
                "kind": "prompt",
                "text": "Rewrite the dispute cap issue in Linear so a Cloud Agent can finish it alone. Add scope, acceptance criteria, a proving test, and judgment calls.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "sort-backlog-async",
            "title": "Sort the backlog into synchronous and asynchronous tasks.",
            "blocks": [
              {
                "kind": "prompt",
                "text": "/ask Which open issues have enough details to delegate to a Cloud Agent? Exclude Collections Command Center issues.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "choose-synchronous-issue",
            "title": "Choose 1 issue that I need to run with a local agent and check synchronously.",
            "blocks": [
              {
                "kind": "prompt",
                "text": "/ask Choose 1 issue that I need to run with a local agent and check synchronously.",
                "label": "Paste in Grok Build"
              }
            ]
          }
        ]
      },
      {
        "id": "how-do-you-delegate-asynchronous-work",
        "title": "How do you delegate asynchronous work?",
        "beats": [
          {
            "id": "check-cloud-environment",
            "title": "Check the cloud environment.",
            "blocks": [
              {
                "kind": "say",
                "text": "This Build already installed the repository’s dependencies, so every agent I start today starts ready to run tests."
              },
              {
                "kind": "steps",
                "lines": [
                  "Go to https://cursor.com/dashboard/cloud-agents.",
                  "Select the environment for the forked repository."
                ]
              }
            ]
          },
          {
            "id": "launch-dispute-cap-agent",
            "title": "Launch Cloud Agents in parallel.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "In the Agents Window, start a new agent.",
                  "Select Cloud in the dropdown above the agent input."
                ]
              },
              {
                "kind": "prompt",
                "text": "Fix the dispute cap issue as written. Run the tests and open a PR with a screenshot of the corrected cap.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "launch-invoice-filter-agent",
            "title": "Fix the invoice filtering issue as written.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Start a new Cloud Agent."
                ]
              },
              {
                "kind": "prompt",
                "text": "Fix the invoice filtering issue as written. Run the tests and open a PR.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "launch-contrast-agent",
            "title": "Fix the failing contrast tests as written.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Start a new Cloud Agent."
                ]
              },
              {
                "kind": "prompt",
                "text": "Fix the failing contrast tests as written. Run the tests and open a PR.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "check-agents-web",
            "title": "Check the agents from another surface.",
            "blocks": [
              {
                "kind": "say",
                "text": "The same agents show up on the web. Stop an agent early if its plan drifts from the issue."
              },
              {
                "kind": "steps",
                "lines": [
                  "Go to cursor.com/agents and select one running agent."
                ]
              }
            ]
          },
          {
            "id": "review-dispute-cap-pr",
            "title": "Review the finished work.",
            "blocks": [
              {
                "kind": "say",
                "text": "The screenshot shows the fix before I check out a single line. Next, I review the diff, then merge it or ask the agent for a change."
              },
              {
                "kind": "steps",
                "lines": [
                  "Select the finished dispute cap agent and review its artifacts and PR."
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "how-do-you-direct-larger-work",
        "title": "How do you direct larger work?",
        "beats": [
          {
            "id": "start-project",
            "title": "Start a Project.",
            "blocks": [
              {
                "kind": "say",
                "text": "The Project opens as a chat with its coordinator. It keeps building the collections command center tonight, after I close my laptop."
              },
              {
                "kind": "steps",
                "lines": [
                  "In the Agents Window, go to Projects in the sidebar and select New Project.",
                  "Enter {{ INSERT COMPANY HERE, default is Ledgerly }} as the name. Under Workspace, select the forked repository. Under Model, select the model the coordinator uses, for example a Grok model.",
                  "Select Create Project."
                ]
              }
            ]
          },
          {
            "id": "hand-coordinator-goal",
            "title": "Hand the coordinator a larger goal.",
            "blocks": [
              {
                "kind": "steps",
                "lines": [
                  "Select + in the chat and put the Project agent in Plan mode."
                ]
              },
              {
                "kind": "prompt",
                "text": "Build the collections command center based on the issues. Split the work across parallel agents, each running the tests and opening a PR. Wait for my approval before building.",
                "label": "Paste in Grok Build"
              }
            ]
          },
          {
            "id": "review-project-plan",
            "title": "Review the plan.",
            "blocks": [
              {
                "kind": "say",
                "text": "The plan shows which tasks run in parallel and which ones wait for another task.\nEvery future agent in this Project starts with the plan, so nobody onboards an agent from scratch."
              },
              {
                "kind": "steps",
                "lines": [
                  "Review the plan."
                ]
              }
            ]
          },
          {
            "id": "build-project-plan",
            "title": "Build the plan.",
            "blocks": [
              {
                "kind": "say",
                "text": "The Project now creates Cloud Agents for each task and tracks their progress."
              },
              {
                "kind": "steps",
                "lines": [
                  "Build the plan."
                ]
              }
            ]
          },
          {
            "id": "track-project-progress",
            "title": "Track the progress.",
            "blocks": [
              {
                "kind": "say",
                "text": "The Project sidebar list the issues and track what is in progress, queued, for review, and done.\nYou can choose List or Board view to review what the Project is building."
              },
              {
                "kind": "steps",
                "lines": [
                  "Open the Project sidebar in the right panel.",
                  "Select the Board view to review the project on a board."
                ]
              }
            ]
          },
          {
            "id": "review-shared-context",
            "title": "Review shared context.",
            "blocks": [
              {
                "kind": "say",
                "text": "The Project writes the plan file to a shared file library that every Cloud Agent can access. If an agent needs more information, it can access the plan as shared context."
              },
              {
                "kind": "steps",
                "lines": [
                  "Select the Library view to review the project’s file changes.",
                  "Open the plan file."
                ]
              }
            ]
          },
          {
            "id": "let-the-work-run",
            "title": "Let the work run.",
            "blocks": [
              {
                "kind": "say",
                "text": "Whatever the coordinator finishes waits in my review queue to check later."
              },
              {
                "kind": "steps",
                "lines": [
                  "Show the Cloud Agent working on its own branch."
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

function numberedSections(track: Track, hidden: Record<string, boolean>): NumberedSection[] {
  const sections: NumberedSection[] = [];
  let number = 0;
  for (const section of track.sections) {
    const beats: NumberedBeat[] = [];
    for (const beat of section.beats) {
      if (beat.feature && hidden[beat.feature] === false) continue;
      number += 1;
      beats.push({ ...beat, number });
    }
    if (beats.length) sections.push({ id: section.id, title: section.title, beats });
  }
  return sections;
}

function CopyPrompt({ text, label }: { text: string; label: string }) {
  const theme = useHostTheme();
  const [copied, setCopied] = useState(false);

  function copy() {
    const done = function () {
      setCopied(true);
      window.setTimeout(function () {
        setCopied(false);
      }, 1600);
    };
    const fallback = function () {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallback();
        done();
      });
      return;
    }
    fallback();
    done();
  }

  return (
    <Stack gap={8}>
      <Row align="center" justify="space-between" gap={8}>
        <Text size="small" weight="semibold" as="span">
          {label}
        </Text>
        <Button variant="secondary" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </Row>
      <pre
        style={{
          margin: 0,
          padding: 12,
          overflow: "auto",
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          background: theme.fill.tertiary,
          color: theme.text.primary,
          border: "1px solid " + theme.stroke.tertiary,
          borderRadius: 8,
          font: "12px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        {text}
      </pre>
    </Stack>
  );
}

function BeatCard({ beat }: { beat: NumberedBeat }) {
  const theme = useHostTheme();
  return (
    <Card>
      <CardBody>
        <Stack gap={12}>
          <Stack gap={4}>
            <Text size="small" tone="secondary" weight="semibold">
              {"Step " + beat.number + (beat.feature ? " · Optional: " + beat.feature : "")}
            </Text>
            <Text weight="semibold" style={{ overflowWrap: "anywhere" }}>
              {beat.title}
            </Text>
          </Stack>
          {beat.blocks.map(function (block, index) {
            if (block.kind === "say") {
              return (
                <Text
                  key={beat.id + "-say-" + index}
                  tone="secondary"
                  size="small"
                  style={{ whiteSpace: "pre-line", overflowWrap: "anywhere" }}
                >
                  {block.text}
                </Text>
              );
            }
            if (block.kind === "steps") {
              const Tag = block.lines.length > 1 ? "ol" : "ul";
              return (
                <Tag
                  key={beat.id + "-steps-" + index}
                  style={{
                    margin: 0,
                    padding: "12px 12px 12px 28px",
                    background: theme.fill.secondary,
                    border: "1px solid " + theme.stroke.tertiary,
                    borderRadius: 8,
                    color: theme.text.primary,
                    fontSize: 12,
                    lineHeight: 1.6,
                    overflowWrap: "anywhere",
                  }}
                >
                  {block.lines.map(function (line) {
                    return <li key={line}>{line}</li>;
                  })}
                </Tag>
              );
            }
            return (
              <CopyPrompt
                key={beat.id + "-prompt-" + index}
                text={block.text}
                label={block.label}
              />
            );
          })}
        </Stack>
      </CardBody>
    </Card>
  );
}

export default function Runbooks() {
  const theme = useHostTheme();
  const [trackId, setTrackId] = useCanvasState<TrackId>("runbooks-track", "101");
  const [features, setFeatures] = useCanvasState<FeatureMap>("runbooks-features", {});

  const track = TRACKS.find(function (entry) {
    return entry.id === trackId;
  }) ?? TRACKS[0];
  const hidden = features[track.id] ?? {};
  const sections = numberedSections(track, hidden);

  function setFeature(feature: string, on: boolean) {
    setFeatures(function (prev) {
      const nextTrack = { ...(prev[track.id] ?? {}) };
      if (on) delete nextTrack[feature];
      else nextTrack[feature] = false;
      return { ...prev, [track.id]: nextTrack };
    });
  }

  return (
    <Stack gap={0} style={{ height: "100%", minHeight: "100vh", background: theme.bg.editor }}>
      <Stack
        gap={12}
        style={{
          padding: 12,
          borderBottom: "1px solid " + theme.stroke.tertiary,
          background: theme.bg.chrome,
        }}
      >
        <Row align="center" justify="space-between" gap={8} wrap>
          <H1>Runbooks</H1>
          <Row gap={8} wrap>
            {TRACKS.map(function (entry) {
              return (
                <Button
                  key={entry.id}
                  variant={entry.id === track.id ? "primary" : "secondary"}
                  onClick={function () {
                    setTrackId(entry.id);
                  }}
                >
                  {entry.title}
                </Button>
              );
            })}
          </Row>
        </Row>
        <Text tone="secondary" size="small">
          {track.description}
        </Text>
        {track.features.length > 0 ? (
          <Row gap={12} wrap>
            {track.features.map(function (feature) {
              return (
                <Checkbox
                  key={feature}
                  checked={hidden[feature] !== false}
                  onChange={function (on) {
                    setFeature(feature, on);
                  }}
                  label={feature}
                />
              );
            })}
          </Row>
        ) : null}
      </Stack>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <Stack gap={24} style={{ padding: 16, width: "100%", boxSizing: "border-box" }}>
          {sections.map(function (section) {
            return (
              <Stack key={section.id} gap={12}>
                <H2>{section.title}</H2>
                {section.beats.map(function (beat) {
                  return <BeatCard key={beat.id} beat={beat} />;
                })}
              </Stack>
            );
          })}
        </Stack>
      </div>
    </Stack>
  );
}
