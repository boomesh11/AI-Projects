import type { Metadata } from "next";
import IntentRail from "@/components/shell/IntentRail";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export const metadata: Metadata = {
  title: {
    default: "Catalyst Studio",
    template: "%s · Catalyst Studio",
  },
};

/**
 * Workspace Shell Layout.
 *
 * Four-zone layout:
 *
 *   ┌──────────────┬──────────────────────────────────┐
 *   │              │  CommandBar                      │
 *   │  IntentRail  ├──────────────────────────────────┤
 *   │   (220px)    │  Dynamic Action / Page Content   │
 *   │              │          (flex-1)                │
 *   └──────────────┴──────────────────────────────────┘
 *   │              CatalystStrip (36px)               │
 *   └─────────────────────────────────────────────────┘
 *
 * CatalystStrip is now rendered inside WorkspaceShell (a Client Component)
 * so it can receive the live sessionId and refreshToken props needed by
 * the MemoryHUD.  The layout itself stays a Server Component.
 *
 * Responsive behavior:
 * - ≥768px: rail visible, canvas fills remaining width
 * - <768px:  rail collapses (future mobile nav)
 */
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "var(--surface-base)",
      }}
    >
      {/* ── Main region: Rail + Canvas ───────────────────────────── */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* Intent navigation rail */}
        <IntentRail />

        {/* Workspace canvas — the only scrolling region */}
        <main
          id="workspace-canvas"
          tabIndex={-1}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            backgroundColor: "var(--surface-base)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/*
           * WorkspaceShell renders:
           *   - CommandBar (with sessionId)
           *   - ActionRenderer (dynamic form)
           *   - {children} (page content)
           *   - CatalystStrip (with sessionId + refreshToken for MemoryHUD)
           */}
          <WorkspaceShell>{children}</WorkspaceShell>
        </main>
      </div>
    </div>
  );
}
