import type { Metadata } from "next";
import { projects } from "@/lib/data/projects";
import { formatDueTime } from "@/lib/utils";
import StatusDot from "@/components/ui/StatusDot";
import Badge from "@/components/ui/Badge";
import { AvatarGroup } from "@/components/ui/Avatar";
import Progress from "@/components/ui/Progress";
import HoverRow from "@/components/ui/HoverRow";
import type { Project, Task } from "@/lib/types";

export const metadata: Metadata = {
  title: "Work",
};

function WorkHeader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "28px",
        paddingBottom: "20px",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <h1 className="type-title">Work</h1>
      <div style={{ display: "flex", gap: "2px" }}>
        {(["All", "Active", "Blocked", "Done"] as const).map((label, i) => (
          <span
            key={label}
            style={{
              padding: "5px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "13px",
              fontWeight: i === 0 ? 500 : 400,
              color: i === 0 ? "var(--text-primary)" : "var(--text-secondary)",
              backgroundColor: i === 0 ? "var(--surface-raised)" : "transparent",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const due = task.dueAt ? formatDueTime(task.dueAt) : null;
  const priorityVariant = `priority-${task.priority}` as const;

  return (
    <HoverRow>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 16px 10px 36px",
          cursor: "pointer",
        }}
      >
        <StatusDot variant={task.status} size={6} />

        <p
          style={{
            flex: 1,
            fontSize: "13px",
            fontWeight: 400,
            color: task.status === "done" ? "var(--text-tertiary)" : "var(--text-primary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textDecoration: task.status === "done" ? "line-through" : "none",
            minWidth: 0,
          }}
        >
          {task.title}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          {due && (
            <span
              className="type-meta"
              style={{
                color: due.isOverdue ? "var(--status-blocked)" : "var(--text-tertiary)",
                fontWeight: due.isOverdue ? 500 : 400,
              }}
            >
              {due.label}
            </span>
          )}
          <Badge variant={priorityVariant} />
          {task.assignee && (
            <AvatarGroup names={[task.assignee]} size="xs" max={1} />
          )}
        </div>
      </div>
    </HoverRow>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const statusVariant = `status-${project.status}` as const;
  const due = project.dueAt ? formatDueTime(project.dueAt) : null;

  return (
    <div
      style={{
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        marginBottom: "12px",
        backgroundColor: "var(--surface-overlay)",
      }}
    >
      {/* Project header — static, not hoverable */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 16px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <StatusDot variant={project.status} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              {project.name}
            </span>
            <Badge variant={statusVariant} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ flex: 1, maxWidth: "200px" }}>
              <Progress
                value={project.progress}
                label={`${project.name}: ${project.progress}% complete`}
                height={3}
                color={
                  project.status === "blocked"
                    ? "blocked"
                    : project.status === "review"
                    ? "review"
                    : "accent"
                }
              />
            </div>
            <span className="type-meta">
              {project.taskDone} / {project.taskTotal} tasks
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          {due && (
            <span
              className="type-meta"
              style={{ color: due.isOverdue ? "var(--status-blocked)" : "var(--text-tertiary)" }}
            >
              {due.label}
            </span>
          )}
          <AvatarGroup names={project.team} size="xs" max={4} />
        </div>
      </div>

      {/* Task rows */}
      {project.tasks.map((task, i) => (
        <div key={task.id}>
          <TaskRow task={task} />
          {i < project.tasks.length - 1 && (
            <hr style={{ border: "none", borderTop: "1px solid var(--border-subtle)", margin: 0 }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function WorkPage() {
  return (
    <div
      style={{
        padding: "var(--canvas-padding-y) var(--canvas-padding-x)",
        maxWidth: "960px",
      }}
    >
      <WorkHeader />

      <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "24px" }}>
        {projects.length} projects ·{" "}
        {projects.reduce((acc, p) => acc + p.taskTotal, 0)} tasks ·{" "}
        {projects.filter((p) => p.status === "blocked").length} blocked
      </p>

      {projects.map((project) => (
        <ProjectRow key={project.id} project={project} />
      ))}
    </div>
  );
}
