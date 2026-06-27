import type { Metadata } from "next";
import IntentRail from "@/components/shell/IntentRail";
import CatalystStrip from "@/components/shell/CatalystStrip";

export const metadata: Metadata = {
  title: {
    default: "Catalyst Studio",
    template: "%s · Catalyst Studio",
  },
};

/**
 * Workspace Shell Layout.
 *
 * Three-zone layout:
 *
 *   ┌──────────────┬──────────────────────────────────┐
 *   │              │                                  │
 *   │  IntentRail  │        Workspace Canvas          │
 *   │   (220px)    │          (flex-1)                │
 *   │              │                                  │
 *   └──────────────┴──────────────────────────────────┘
 *   │              CatalystStrip (36px)               │
 *   └─────────────────────────────────────────────────┘
 *
 * The rail and strip are fixed to the viewport.
 * The canvas is the only scrolling region.
 *
 * Responsive behavior:
 * - ≥768px: rail visible, canvas fills remaining width
 * - <768px:  rail collapses (future Sprint 2 mobile nav)
 *
 * Server Component — interactivity is delegated to children.
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
          }}
        >
          {children}
        </main>
      </div>

      {/* ── Catalyst Strip — ambient AI status ────────────────────── */}
      <CatalystStrip />
    </div>
  );
}
