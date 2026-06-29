import type { Metadata } from "next";
import { activityLog } from "@/lib/data/activity";
import { formatRelativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import type { ActivityEntry } from "@/lib/types";
import EmployeeTable from "@/components/workspace/EmployeeTable";

export const metadata: Metadata = {
  title: "People",
};

// ─────────────────────────────────────────────────────────────────
// Activity log entry
// ─────────────────────────────────────────────────────────────────

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        padding: "10px 0",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* Timestamp — left-aligned column */}
      <span
        className="type-meta"
        style={{
          flexShrink: 0,
          minWidth: "72px",
          paddingTop: "2px",
        }}
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
        <span style={{ color: "var(--text-primary)" }}>
          {entry.subject}
        </span>{" "}
        in{" "}
        <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
          {entry.projectName}
        </span>
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// People Page
// ─────────────────────────────────────────────────────────────────

export default function PeoplePage() {
  // Show only today's + yesterday's activity in the sidebar log
  const recentActivity = activityLog.slice(0, 7);

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
        <h1 className="type-title">People</h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: "48px",
          alignItems: "start",
        }}
      >
        {/* ── Left: Team roster ───────────────────────────────────── */}
        <div>
          <EmployeeTable />
        </div>

        {/* ── Right: Recent activity log ───────────────────────────── */}
        <div>
          <p className="type-section-label" style={{ marginBottom: "12px" }}>
            Recent Activity
          </p>

          {recentActivity.map((entry) => (
            <ActivityRow key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}
