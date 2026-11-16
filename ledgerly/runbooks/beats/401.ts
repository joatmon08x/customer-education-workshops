import type { DemoSection } from "@/runbooks/types";

export const RUNBOOK_SECTIONS_401 = [
  {
    id: "what-tasks-do-you-delegate",
    title: "What tasks do you delegate?",
    beats: [
      {
        id: "start-delegate-agent",
        title: "Start a new agent.",
        promptType: "none",
        say: "Before I hand work to asynchronous agents, I need to rewrite a task so an agent can finish it unattended.",
        detail: "Go to the Agents Window and start a new local agent.",
      },
      {
        id: "rewrite-dispute-cap",
        title: "Rewrite a task so an agent can finish it unattended.",
        promptType: "adaptable",
        say: "Scope, acceptance criteria, proof, and judgment calls give the agent a finish line it can check.\nThe invoice and contrast tasks are already written this way. I'll only rewrite dispute cap live.",
        detail: "",
        example:
          "Rewrite the dispute cap issue in Linear so a Cloud Agent can finish it alone. Add scope, acceptance criteria, a proving test, and judgment calls.",
      },
      {
        id: "sort-backlog-async",
        title: "Sort the backlog into tasks to hand off and tasks to keep.",
        promptType: "reusable",
        say: "Expect candidates such as the dispute cap bug, the invoice filter bug, and the contrast fix.",
        detail: "",
        example:
          "/ask Which open issues have enough details to delegate to a Cloud Agent? Exclude Collections Command Center issues.",
      },
      {
        id: "choose-synchronous-issue",
        title: "Choose one task that I need to run with a local agent and check myself.",
        promptType: "reusable",
        say: "If the agent flags keyboard walkthrough or similar exploratory checks, keep those with you.\nI can delegate the dispute cap bug, the UI filter bug, and the accessibility fix to asynchronous agents. The keyboard walkthrough is an exploratory check, so I'll do it myself.",
        detail: "",
        example: "/ask Choose one task that I need to run with a local agent and check myself.",
      },
    ],
  },
  {
    id: "how-do-you-delegate-asynchronous-work",
    title: "How do you delegate asynchronous work?",
    beats: [
      {
        id: "check-cloud-environment",
        title: "Check the cloud environment.",
        promptType: "none",
        say: "This Build already installed the repository's dependencies, so every agent I start today starts ready to run tests.",
        detail:
          "Go to https://cursor.com/dashboard/cloud-agents.\nSelect the environment for the forked repository.",
      },
      {
        id: "launch-dispute-cap-agent",
        title: "Launch Cloud Agents in parallel.",
        promptType: "adaptable",
        detail:
          "In the Agents Window, start a new agent.\nSelect Cloud in the dropdown above the agent input.",
        example:
          "Fix the dispute cap issue as written. Run the tests and open a PR with a screenshot of the corrected cap.",
        after: [
          {
            kind: "do",
            text: "Start a new Cloud Agent.",
          },
          {
            kind: "prompt",
            promptType: "adaptable",
            text: "Fix the invoice filtering issue as written. Run the tests and open a PR.",
          },
        ],
      },
      {
        id: "launch-contrast-agent",
        title: "Use a /goal to assign an ongoing objective.",
        promptType: "adaptable",
        say: "This is the same kind of Cloud Agent as the other two, with /goal turned on. The other two stop when they think they're done. This one keeps starting new turns until the goal is complete. Its finish line: the accessibility tests pass.",
        detail: "Start a new Cloud Agent.",
        example:
          "/goal Fix the failing contrast tests as written, in app/globals.css tokens only. Done when the accessibility tests pass.",
      },
      {
        id: "check-agents-web",
        title: "Check the agents from another surface.",
        promptType: "none",
        say: "The same agents show up on the web, including the goal agent. A goal you run in a local chat doesn't show up here, so use a Cloud Agent when the goal has to wait on CI or keep running after you close your laptop. Stop an agent early if its plan drifts from the task. To end a goal, archive the agent.",
        detail: "Go to cursor.com/agents and select one running agent.",
      },
      {
        id: "review-dispute-cap-pr",
        title: "Review the finished work.",
        promptType: "none",
        say: "The screenshot shows the fix before I check out a single line. Next, I review the diff, then merge it or ask the agent for a change.",
        detail: "Select the finished dispute cap agent and review its artifacts and PR.",
      },
    ],
  },
  {
    id: "how-do-you-direct-larger-work",
    title: "How do you direct larger work?",
    beats: [
      {
        id: "start-project",
        title: "Start a Project.",
        promptType: "none",
        say: "The Project opens as a chat with its coordinator. It keeps building the collections command center tonight, after I close my laptop.",
        detail:
          "In the Agents Window, go to Projects in the sidebar and select New Project.\nEnter Collections Command Center as the name. Under Workspace, select the forked repository. Under Model, select the model the coordinator uses, for example a Grok model.\nSelect Create Project.",
      },
      {
        id: "review-project-model",
        title: "Review the model.",
        promptType: "none",
        say: "You can choose the model for the coordinator and workers. Workers inherit the coordinator's model by default.",
        detail: "Select Auto in the chat.",
      },
      {
        id: "hand-coordinator-goal",
        title: "Hand the coordinator a larger goal.",
        promptType: "adaptable",
        say: "Expect a plan that splits the work across agents.",
        detail: "Select + in the chat and put the Project agent in Plan mode.",
        example:
          "Build the collections command center based on its Linear issues. Split the work across parallel agents, each running the tests and opening a PR. Wait for my approval before building.",
      },
      {
        id: "review-project-plan",
        title: "Review the plan.",
        promptType: "none",
        say: "The plan shows which tasks run in parallel and which ones wait for another task.\nEvery future agent in this Project starts with the plan, so nobody onboards an agent from scratch.",
        detail: "Review the plan.",
      },
      {
        id: "build-project-plan",
        title: "Build the plan.",
        promptType: "none",
        say: "The Project now creates Cloud Agents for each task and tracks their progress.",
        detail: "Build the plan.",
      },
      {
        id: "track-project-progress",
        title: "Track the progress.",
        promptType: "none",
        say: "The Project sidebar lists the tasks and tracks what is in progress, queued, for review, and done.\nYou can choose List or Board view to review what the Project is building.",
        detail:
          "Open the Project sidebar in the right panel.\nSelect the Board view to review the project on a board.",
      },
      {
        id: "review-shared-context",
        title: "Review shared context.",
        promptType: "none",
        say: "The Project writes the plan file to a shared file library that every Cloud Agent can access. If an agent needs more information, it can access the plan as shared context.",
        detail: "Select the Library view to review the project's file changes.\nOpen the plan file.",
      },
      {
        id: "let-the-work-run",
        title: "Let the work run.",
        promptType: "none",
        say: "Whatever the coordinator finishes waits in my review queue to check later.",
        detail: "Show the Cloud Agent working on its own branch.",
      },
    ],
  },
] as const satisfies readonly DemoSection[];
