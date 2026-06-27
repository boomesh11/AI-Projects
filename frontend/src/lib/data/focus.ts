import type { FocusItem, PendingAction, InProgressItem } from "@/lib/types";

/**
 * Focus Stack — the 4 most urgent items for today.
 * Surfaced across all work types: tasks, reviews, decisions, blockers.
 * Sorted by urgency (overdue first, then soonest due).
 */
export const focusItems: FocusItem[] = [
  {
    id: "focus-1",
    title: "Finalize API contract for mobile handoff",
    type: "decision",
    status: "blocked",
    projectName: "Alpha Launch",
    projectId: "proj-1",
    dueAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h overdue
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    assignees: ["Alex Chen", "Jordan Park"],
    isOverdue: true,
  },
  {
    id: "focus-2",
    title: "Review Q3 go-to-market brief before team sync",
    type: "review",
    status: "review",
    projectName: "GTM Strategy",
    projectId: "proj-3",
    dueAt: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(), // 1.5h from now
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    assignees: ["Alex Chen"],
    isOverdue: false,
  },
  {
    id: "focus-3",
    title: "Approve infrastructure cost increase for staging",
    type: "approval",
    status: "review",
    projectName: "Platform Infra",
    projectId: "proj-2",
    dueAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4h from now
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    assignees: ["Marcus Webb", "Alex Chen"],
    isOverdue: false,
  },
  {
    id: "focus-4",
    title: "Unblock design handoff — awaiting brand assets",
    type: "blocker",
    status: "blocked",
    projectName: "Alpha Launch",
    projectId: "proj-1",
    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // tomorrow
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    assignees: ["Sam Rivers"],
    isOverdue: false,
  },
];

/**
 * Pending Actions — items explicitly waiting on Alex Chen.
 * These require a direct response, approval, or input.
 */
export const pendingActions: PendingAction[] = [
  {
    id: "pending-1",
    title: "Code review: authentication refactor (PR #214)",
    type: "review",
    requestedBy: "Jordan Park",
    projectName: "Platform Infra",
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    catalystHint: "Similar patterns approved in PR #198. This looks consistent.",
  },
  {
    id: "pending-2",
    title: "Approve Q3 marketing budget increase (+18%)",
    type: "approval",
    requestedBy: "Priya Nair",
    projectName: "GTM Strategy",
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    catalystHint: "Budget context from last quarter attached in the brief.",
  },
  {
    id: "pending-3",
    title: "Feedback needed on mobile nav spec revision",
    type: "feedback",
    requestedBy: "Sam Rivers",
    projectName: "Alpha Launch",
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * In Progress — work actively touched in the last 48 hours.
 * Shows what Alex Chen is currently in the middle of.
 */
export const inProgressItems: InProgressItem[] = [
  {
    id: "ip-1",
    title: "Define authentication flow for third-party integrations",
    type: "task",
    status: "active",
    projectName: "Platform Infra",
    lastTouchedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: "ip-2",
    title: "Draft positioning document for enterprise tier",
    type: "task",
    status: "active",
    projectName: "GTM Strategy",
    lastTouchedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ip-3",
    title: "Review and annotate mobile prototype v3",
    type: "review",
    status: "review",
    projectName: "Alpha Launch",
    lastTouchedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ip-4",
    title: "Stakeholder presentation — board update slides",
    type: "task",
    status: "idle",
    projectName: "GTM Strategy",
    lastTouchedAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
  },
];
