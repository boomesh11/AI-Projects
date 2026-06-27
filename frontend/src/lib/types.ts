/**
 * Catalyst Studio — Shared TypeScript Types
 *
 * All domain types used across workspace sections.
 * No API types — all data is mock for Sprint 1.
 */

import type { StatusDotVariant } from "@/components/ui/StatusDot";
import type { BadgeVariant } from "@/components/ui/Badge";

// ─────────────────────────────────────────────────────────────────
// User & Workspace
// ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  role: string;
  avatarSrc?: string;
  /** Online presence status */
  presence: "online" | "away" | "offline";
}

export interface Workspace {
  id: string;
  name: string;
  plan: "starter" | "pro" | "enterprise";
}

// ─────────────────────────────────────────────────────────────────
// Focus & Work Items
// ─────────────────────────────────────────────────────────────────

export type WorkItemType = "task" | "review" | "decision" | "approval" | "blocker";

export interface FocusItem {
  id: string;
  title: string;
  type: WorkItemType;
  status: StatusDotVariant;
  projectName: string;
  projectId: string;
  /** ISO date string — used to compute relative time */
  dueAt?: string;
  /** ISO date string — when item was last updated */
  updatedAt: string;
  assignees: string[]; // User names for avatar generation
  isOverdue?: boolean;
}

export interface PendingAction {
  id: string;
  title: string;
  type: "review" | "approval" | "feedback" | "reply";
  requestedBy: string;
  projectName: string;
  updatedAt: string;
  /** Ambient AI suggestion for this action */
  catalystHint?: string;
}

export interface InProgressItem {
  id: string;
  title: string;
  type: WorkItemType;
  status: StatusDotVariant;
  projectName: string;
  lastTouchedAt: string;
}

// ─────────────────────────────────────────────────────────────────
// Projects & Tasks
// ─────────────────────────────────────────────────────────────────

export type ProjectStatus = "active" | "blocked" | "review" | "done" | "idle";
export type TaskPriority = "high" | "medium" | "low";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number; // 0–100
  taskTotal: number;
  taskDone: number;
  dueAt?: string;
  team: string[]; // User names
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  status: StatusDotVariant;
  priority: TaskPriority;
  assignee?: string;
  dueAt?: string;
  projectId: string;
  projectName: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────
// Documents
// ─────────────────────────────────────────────────────────────────

export type DocType = "brief" | "spec" | "report" | "notes";
export type DocStatus = "draft" | "in-review" | "approved" | "archived";

export interface Document {
  id: string;
  title: string;
  type: DocType;
  status: DocStatus;
  projectName: string;
  projectId: string;
  authorName: string;
  lastEditedBy: string;
  updatedAt: string;
  wordCount?: number;
}

// ─────────────────────────────────────────────────────────────────
// Activity
// ─────────────────────────────────────────────────────────────────

export type ActivityVerb =
  | "completed"
  | "created"
  | "updated"
  | "commented on"
  | "blocked"
  | "unblocked"
  | "approved"
  | "moved to review"
  | "assigned"
  | "closed";

export interface ActivityEntry {
  id: string;
  actorName: string;
  verb: ActivityVerb;
  /** What was acted upon */
  subject: string;
  subjectType: "task" | "document" | "project";
  projectName: string;
  timestamp: string;
}

// ─────────────────────────────────────────────────────────────────
// Utility re-exports for convenience
// ─────────────────────────────────────────────────────────────────

export type { StatusDotVariant, BadgeVariant };
