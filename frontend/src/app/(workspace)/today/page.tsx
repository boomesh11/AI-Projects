import type { Metadata } from "next";
import { focusItems, pendingActions, inProgressItems } from "@/lib/data/focus";
import { documents } from "@/lib/data/documents";
import { formatRelativeTime, formatDueTime } from "@/lib/utils";
import StatusDot from "@/components/ui/StatusDot";
import Badge from "@/components/ui/Badge";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import HoverRow from "@/components/ui/HoverRow";
import type { FocusItem, PendingAction, InProgressItem, Document } from "@/lib/types";

export const metadata: Metadata = {
  title: "Today",
};

// ─────────────────────────────────────────────────────────────────
// Section layout helper
// ─────────────────────────────────────────────────────────────────

function Section({
  label,
  count,
  children,
}: {
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "40px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <span className="type-section-label">{label}</span>
        {count !== undefined && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "18px",
              height: "18px",
              padding: "0 5px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--surface-inset)",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-tertiary)",
              lineHeight: 1,
            }}
          >
            {count}
          </span>
        )}
      </div>
      <div
        style={{
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function RowDivider() {
  return (
    <hr
      style={{
        border: "none",
        borderTop: "1px solid var(--border-subtle)",
        margin: 0,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────
// Context Snapshot — ambient AI summary line
// ─────────────────────────────────────────────────────────────────

function ContextSnapshot() {
  const overdueCount = focusItems.filter((i) => i.isOverdue).length;
  const pendingCount = pendingActions.length;

  return (
    <div
      style={{
        marginBottom: "36px",
        paddingBottom: "28px",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <h1
        style={{
          fontSize: "22px",
          fontWeight: 600,
          color: "var(--text-primary)",
          letterSpacing: "-0.025em",
          lineHeight: 1.2,
          marginBottom: "10px",
        }}
      >
        Good morning, Alex.
      </h1>

      <p
        style={{
          fontSize: "14px",
          color: "var(--text-secondary)",
          lineHeight: 1.5,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "wrap",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "16px",
            height: "16px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--accent-muted)",
            flexShrink: 0,
          }}
        >
          <svg width="8" height="8" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M11 4C10.1 2.8 8.65 2 7 2C4.24 2 2 4.24 2 7C2 9.76 4.24 12 7 12C8.65 12 10.1 11.2 11 10"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span>
          You have{" "}
          <strong
            style={{
              color: overdueCount > 0 ? "var(--status-blocked)" : "var(--text-primary)",
              fontWeight: 600,
            }}
          >
            {overdueCount} overdue item{overdueCount !== 1 ? "s" : ""}
          </strong>
          ,{" "}
          <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            {pendingCount} pending action{pendingCount !== 1 ? "s" : ""}
          </strong>{" "}
          waiting on you, and a team sync this afternoon.
        </span>
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Focus Stack Row
// ─────────────────────────────────────────────────────────────────

function FocusRow({ item }: { item: FocusItem }) {
  const due = item.dueAt ? formatDueTime(item.dueAt) : null;

  return (
    <HoverRow>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          padding: "13px 16px",
          cursor: "pointer",
        }}
      >
        <div style={{ paddingTop: "3px", flexShrink: 0 }}>
          <StatusDot variant={item.status} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            className="type-row-primary"
            style={{
              marginBottom: "4px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.title}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span className="type-meta">{item.projectName}</span>
            {due && (
              <>
                <span className="type-meta" aria-hidden="true">·</span>
                <span
                  className="type-meta"
                  style={{
                    color: due.isOverdue ? "var(--status-blocked)" : "var(--text-tertiary)",
                    fontWeight: due.isOverdue ? 500 : 400,
                  }}
                >
                  {due.label}
                </span>
              </>
            )}
          </div>
        </div>

        {item.assignees.length > 0 && (
          <div style={{ flexShrink: 0, paddingTop: "1px" }}>
            <AvatarGroup names={item.assignees} size="xs" max={3} />
          </div>
        )}
      </div>
    </HoverRow>
  );
}

// ─────────────────────────────────────────────────────────────────
// Pending Action Row
// ─────────────────────────────────────────────────────────────────

function PendingRow({ item }: { item: PendingAction }) {
  const typeLabel: Record<PendingAction["type"], string> = {
    review:   "Review",
    approval: "Approval",
    feedback: "Feedback",
    reply:    "Reply",
  };

  return (
    <HoverRow>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          padding: "13px 16px",
          cursor: "pointer",
        }}
      >
        <div style={{ paddingTop: "3px", flexShrink: 0 }}>
          <StatusDot variant="review" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            className="type-row-primary"
            style={{
              marginBottom: "4px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.title}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span className="type-meta">From {item.requestedBy} · {item.projectName}</span>
            <span className="type-meta" aria-hidden="true">·</span>
            <span className="type-meta">{formatRelativeTime(item.updatedAt)}</span>
          </div>

          {item.catalystHint && (
            <p
              style={{
                marginTop: "5px",
                fontSize: "12px",
                color: "var(--accent-text)",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M11 4C10.1 2.8 8.65 2 7 2C4.24 2 2 4.24 2 7C2 9.76 4.24 12 7 12C8.65 12 10.1 11.2 11 10"
                  stroke="var(--accent)"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
              {item.catalystHint}
            </p>
          )}
        </div>

        <div style={{ flexShrink: 0, paddingTop: "1px" }}>
          <Badge variant="status-review">{typeLabel[item.type]}</Badge>
        </div>
      </div>
    </HoverRow>
  );
}

// ─────────────────────────────────────────────────────────────────
// In Progress Row
// ─────────────────────────────────────────────────────────────────

function InProgressRow({ item }: { item: InProgressItem }) {
  return (
    <HoverRow>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          padding: "13px 16px",
          cursor: "pointer",
        }}
      >
        <div style={{ paddingTop: "3px", flexShrink: 0 }}>
          <StatusDot variant={item.status} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            className="type-row-primary"
            style={{
              marginBottom: "4px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.title}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="type-meta">{item.projectName}</span>
            <span className="type-meta" aria-hidden="true">·</span>
            <span className="type-meta">{formatRelativeTime(item.lastTouchedAt)}</span>
          </div>
        </div>
      </div>
    </HoverRow>
  );
}

// ─────────────────────────────────────────────────────────────────
// Recent Document Row
// ─────────────────────────────────────────────────────────────────

function RecentDocRow({ doc }: { doc: Document }) {
  const badgeVariant = `doc-${doc.type}` as const;

  return (
    <HoverRow>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px 16px",
          cursor: "pointer",
        }}
      >
        <Badge variant={badgeVariant} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            className="type-row-primary"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {doc.title}
          </p>
        </div>

        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span className="type-meta">{doc.projectName}</span>
          <span className="type-meta" aria-hidden="true">·</span>
          <span className="type-meta">{formatRelativeTime(doc.updatedAt)}</span>
          <Avatar name={doc.lastEditedBy} size="xs" />
        </div>
      </div>
    </HoverRow>
  );
}

// ─────────────────────────────────────────────────────────────────
// Today Page — Workspace Hub
// ─────────────────────────────────────────────────────────────────

export default function TodayPage() {
  const recentDocs = documents.slice(0, 4);

  return (
    <div
      style={{
        padding: "var(--canvas-padding-y) var(--canvas-padding-x)",
        maxWidth: "calc(var(--canvas-max-width) + (var(--canvas-padding-x) * 2))",
      }}
    >
      <ContextSnapshot />

      <Section label="Focus" count={focusItems.length}>
        {focusItems.map((item, i) => (
          <div key={item.id}>
            <FocusRow item={item} />
            {i < focusItems.length - 1 && <RowDivider />}
          </div>
        ))}
      </Section>

      <Section label="Waiting on You" count={pendingActions.length}>
        {pendingActions.map((item, i) => (
          <div key={item.id}>
            <PendingRow item={item} />
            {i < pendingActions.length - 1 && <RowDivider />}
          </div>
        ))}
      </Section>

      <Section label="In Progress" count={inProgressItems.length}>
        {inProgressItems.map((item, i) => (
          <div key={item.id}>
            <InProgressRow item={item} />
            {i < inProgressItems.length - 1 && <RowDivider />}
          </div>
        ))}
      </Section>

      <Section label="Recent Documents" count={recentDocs.length}>
        {recentDocs.map((doc, i) => (
          <div key={doc.id}>
            <RecentDocRow doc={doc} />
            {i < recentDocs.length - 1 && <RowDivider />}
          </div>
        ))}
      </Section>
    </div>
  );
}
