import type { Metadata } from "next";
import { documents } from "@/lib/data/documents";
import { formatRelativeTime, getDayGroup } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import HoverRow from "@/components/ui/HoverRow";
import type { Document } from "@/lib/types";

export const metadata: Metadata = {
  title: "Docs",
};

const DOC_STATUS_LABEL: Record<Document["status"], string> = {
  draft:       "Draft",
  "in-review": "In Review",
  approved:    "Approved",
  archived:    "Archived",
};

const DOC_STATUS_COLOR: Record<Document["status"], string> = {
  draft:       "var(--text-tertiary)",
  "in-review": "var(--status-review)",
  approved:    "var(--status-active)",
  archived:    "var(--status-done)",
};

function DocumentRow({ doc }: { doc: Document }) {
  const badgeVariant = `doc-${doc.type}` as const;

  return (
    <HoverRow>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "12px 0",
          borderBottom: "1px solid var(--border-subtle)",
          cursor: "pointer",
        }}
      >
        <Badge variant={badgeVariant} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginBottom: "3px",
            }}
          >
            {doc.title}
          </p>
          <span className="type-meta">{doc.projectName}</span>
        </div>

        <span
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: DOC_STATUS_COLOR[doc.status],
            flexShrink: 0,
            minWidth: "72px",
            textAlign: "right",
          }}
        >
          {DOC_STATUS_LABEL[doc.status]}
        </span>

        {doc.wordCount && (
          <span
            className="type-meta"
            style={{ flexShrink: 0, minWidth: "60px", textAlign: "right" }}
          >
            {doc.wordCount.toLocaleString()} words
          </span>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexShrink: 0,
            minWidth: "120px",
            justifyContent: "flex-end",
          }}
        >
          <Avatar name={doc.lastEditedBy} size="xs" />
          <span className="type-meta">{formatRelativeTime(doc.updatedAt)}</span>
        </div>
      </div>
    </HoverRow>
  );
}

function groupDocumentsByRecency(docs: Document[]): Map<string, Document[]> {
  const map = new Map<string, Document[]>();
  const order = ["Today", "Yesterday", "This Week", "Last Week"];

  for (const doc of docs) {
    const group = getDayGroup(doc.updatedAt);
    if (!map.has(group)) map.set(group, []);
    map.get(group)!.push(doc);
  }

  const sorted = new Map<string, Document[]>();
  for (const key of order) {
    if (map.has(key)) sorted.set(key, map.get(key)!);
  }
  for (const [key, value] of map) {
    if (!sorted.has(key)) sorted.set(key, value);
  }
  return sorted;
}

export default function DocsPage() {
  const grouped = groupDocumentsByRecency(documents);

  return (
    <div
      style={{
        padding: "var(--canvas-padding-y) var(--canvas-padding-x)",
        maxWidth: "900px",
      }}
    >
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
        <h1 className="type-title">Docs</h1>
        <span className="type-meta">{documents.length} documents</span>
      </div>

      {/* Column headers */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          paddingBottom: "8px",
          borderBottom: "1px solid var(--border-default)",
          marginBottom: "4px",
        }}
      >
        <span className="type-section-label" style={{ minWidth: "60px" }}>Type</span>
        <span className="type-section-label" style={{ flex: 1 }}>Title</span>
        <span className="type-section-label" style={{ minWidth: "72px", textAlign: "right" }}>Status</span>
        <span className="type-section-label" style={{ minWidth: "60px", textAlign: "right" }}>Words</span>
        <span className="type-section-label" style={{ minWidth: "120px", textAlign: "right" }}>Last Edited</span>
      </div>

      {Array.from(grouped.entries()).map(([group, docs]) => (
        <div key={group} style={{ marginTop: "24px" }}>
          <p className="type-section-label" style={{ marginBottom: "4px", color: "var(--text-tertiary)" }}>
            {group}
          </p>
          {docs.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </div>
      ))}
    </div>
  );
}
