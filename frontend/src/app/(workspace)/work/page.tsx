import type { Metadata } from "next";
import ProjectTable from "@/components/workspace/ProjectTable";

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

export default function WorkPage() {
  return (
    <div
      style={{
        padding: "var(--canvas-padding-y) var(--canvas-padding-x)",
        maxWidth: "960px",
      }}
    >
      <WorkHeader />

      <ProjectTable />
    </div>
  );
}
