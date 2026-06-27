import type { Metadata } from "next";
import { teamMembers } from "@/lib/data/team";
import { activityLog } from "@/lib/data/activity";
import { formatRelativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import StatusDot from "@/components/ui/StatusDot";
import HoverRow from "@/components/ui/HoverRow";
import type { User, ActivityEntry } from "@/lib/types";

export const metadata: Metadata = {
  title: "People",
};

// ─────────────────────────────────────────────────────────────────
// Presence → StatusDot variant map
// ─────────────────────────────────────────────────────────────────

const PRESENCE_VARIANT = {
  online:  "active",
  away:    "review",
  offline: "idle",
} as const satisfies Record<User["presence"], "active" | "review" | "idle">;

const PRESENCE_LABEL: Record<User["presence"], string> = {
  online:  "Online",
  away:    "Away",
  offline: "Offline",
};

// ─────────────────────────────────────────────────────────────────
// Team member card — horizontal layout
// ─────────────────────────────────────────────────────────────────

function MemberRow({ user }: { user: User }) {
  const lastActivity = activityLog.find((e) => e.actorName === user.name);

  return (
    <HoverRow style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "14px 0",
        }}
      >
        <Avatar name={user.name} size="md" />

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--text-primary)",
              marginBottom: "3px",
            }}
          >
            {user.name}
          </p>
          <span className="type-meta">{user.role}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexShrink: 0,
            minWidth: "80px",
          }}
        >
          <StatusDot variant={PRESENCE_VARIANT[user.presence]} size={6} />
          <span className="type-meta">{PRESENCE_LABEL[user.presence]}</span>
        </div>

        <div style={{ flexShrink: 0, minWidth: "240px", textAlign: "right" }}>
          {lastActivity ? (
            <span className="type-meta">
              {lastActivity.verb}{" "}
              <span style={{ color: "var(--text-secondary)" }}>
                {lastActivity.subject}
              </span>{" "}
              · {formatRelativeTime(lastActivity.timestamp)}
            </span>
          ) : (
            <span className="type-meta">No recent activity</span>
          )}
        </div>
      </div>
    </HoverRow>
  );
}

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
          <p className="type-section-label" style={{ marginBottom: "12px" }}>
            Team · {teamMembers.length} members
          </p>

          {/* Column headers */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              paddingBottom: "8px",
              borderBottom: "1px solid var(--border-default)",
              marginBottom: "0",
            }}
          >
            <div style={{ width: "32px" }} aria-hidden="true" />
            <span className="type-section-label" style={{ flex: 1 }}>
              Name
            </span>
            <span className="type-section-label" style={{ minWidth: "80px" }}>
              Status
            </span>
            <span
              className="type-section-label"
              style={{ minWidth: "240px", textAlign: "right" }}
            >
              Last Activity
            </span>
          </div>

          {teamMembers.map((user) => (
            <MemberRow key={user.id} user={user} />
          ))}
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
