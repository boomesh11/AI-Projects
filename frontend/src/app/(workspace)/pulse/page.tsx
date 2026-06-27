import type { Metadata } from "next";
import { activityLog } from "@/lib/data/activity";
import { projects } from "@/lib/data/projects";
import { formatRelativeTime, getDayGroup } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import Progress from "@/components/ui/Progress";
import type { ActivityEntry, Project } from "@/lib/types";

export const metadata: Metadata = {
  title: "Pulse",
};

// ─────────────────────────────────────────────────────────────────
// Activity entry — natural language, left-timestamped
// ─────────────────────────────────────────────────────────────────

function PulseActivityRow({ entry }: { entry: ActivityEntry }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "11px 0",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* Timestamp column */}
      <span
        className="type-meta"
        style={{ flexShrink: 0, minWidth: "80px", paddingTop: "2px" }}
      >
        {formatRelativeTime(entry.timestamp)}
      </span>

      {/* Avatar */}
      <Avatar name={entry.actorName} size="xs" />

      {/* Description */}
      <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
        <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
          {entry.actorName}
        </span>{" "}
        {entry.verb}{" "}
        <span style={{ color: "var(--text-primary)" }}>{entry.subject}</span>{" "}
        in{" "}
        <span style={{ fontWeight: 500 }}>{entry.projectName}</span>
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Project progress summary — text-only, no charts
// ─────────────────────────────────────────────────────────────────

function ProjectProgressRow({ project }: { project: Project }) {
  const blockedTasks = project.tasks.filter((t) => t.status === "blocked").length;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "12px 0",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* Project name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-primary)",
            marginBottom: "5px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {project.name}
        </p>
        <Progress
          value={project.progress}
          label={`${project.name}: ${project.progress}% complete`}
          height={2}
          color={project.status === "blocked" ? "blocked" : "accent"}
        />
      </div>

      {/* Stats */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          gap: "16px",
          alignItems: "center",
        }}
      >
        <span className="type-meta">{project.taskDone} / {project.taskTotal} tasks</span>
        {blockedTasks > 0 && (
          <span
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--status-blocked)",
            }}
          >
            {blockedTasks} blocked
          </span>
        )}
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--text-secondary)",
          }}
        >
          {project.progress}%
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Group activity entries by day
// ─────────────────────────────────────────────────────────────────

function groupActivityByDay(
  entries: ActivityEntry[]
): Map<string, ActivityEntry[]> {
  const map = new Map<string, ActivityEntry[]>();
  const order = ["Today", "Yesterday", "This Week", "Last Week"];

  for (const entry of entries) {
    const group = getDayGroup(entry.timestamp);
    if (!map.has(group)) map.set(group, []);
    map.get(group)!.push(entry);
  }

  const sorted = new Map<string, ActivityEntry[]>();
  for (const key of order) {
    if (map.has(key)) sorted.set(key, map.get(key)!);
  }
  for (const [key, value] of map) {
    if (!sorted.has(key)) sorted.set(key, value);
  }
  return sorted;
}

// ─────────────────────────────────────────────────────────────────
// Pulse Page
// ─────────────────────────────────────────────────────────────────

export default function PulsePage() {
  const grouped = groupActivityByDay(activityLog);

  return (
    <div
      style={{
        padding: "var(--canvas-padding-y) var(--canvas-padding-x)",
      }}
    >
      {/* Page header */}
      <div
        style={{
          marginBottom: "28px",
          paddingBottom: "20px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <h1 className="type-title">Pulse</h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: "48px",
          alignItems: "start",
        }}
      >
        {/* ── Left: Chronological activity log ──────────────────────── */}
        <div>
          {Array.from(grouped.entries()).map(([group, entries]) => (
            <div key={group} style={{ marginBottom: "28px" }}>
              <p
                className="type-section-label"
                style={{ marginBottom: "8px" }}
              >
                {group}
              </p>
              {entries.map((entry) => (
                <PulseActivityRow key={entry.id} entry={entry} />
              ))}
            </div>
          ))}
        </div>

        {/* ── Right: Project progress summaries ─────────────────────── */}
        <div>
          <p className="type-section-label" style={{ marginBottom: "12px" }}>
            Project Progress
          </p>

          {projects
            .filter((p) => p.status !== "done")
            .map((project) => (
              <ProjectProgressRow key={project.id} project={project} />
            ))}
        </div>
      </div>
    </div>
  );
}
