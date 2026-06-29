/**
 * CatalystStrip — Ambient AI status bar (v2: session-aware).
 *
 * Four zones left-to-right:
 *   [logo + status text]  [MemoryHUD — grows in center]  [⌘K hint]
 *
 * Becomes a Client Component in v2 because it accepts sessionId and
 * refreshToken from WorkspaceShell to drive the MemoryHUD.
 */
"use client";

import MemoryHUD from "@/components/shell/MemoryHUD";

interface CatalystStripProps {
  sessionId: string;
  refreshToken: number;
  onSessionReset: (newSessionId: string) => void;
}

export default function CatalystStrip({
  sessionId,
  refreshToken,
  onSessionReset,
}: CatalystStripProps) {
  return (
    <footer
      aria-label="Catalyst AI status"
      style={{
        height: "var(--strip-height)",
        borderTop: "1px solid var(--border-subtle)",
        backgroundColor: "var(--surface-base)",
        display: "flex",
        alignItems: "center",
        paddingLeft: "var(--canvas-padding-x)",
        paddingRight: "var(--canvas-padding-x)",
        gap: "8px",
        flexShrink: 0,
      }}
    >
      {/* Catalyst logomark — small, subdued */}
      <svg
        width="12"
        height="12"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        style={{ opacity: 0.4, flexShrink: 0 }}
      >
        <path
          d="M11 4C10.1 2.8 8.65 2 7 2C4.24 2 2 4.24 2 7C2 9.76 4.24 12 7 12C8.65 12 10.1 11.2 11 10"
          stroke="var(--text-primary)"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>

      {/* Status text */}
      <span
        style={{
          fontSize: "11px",
          color: "var(--text-tertiary)",
          fontWeight: 400,
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        Catalyst ready
      </span>

      {/* ── Memory HUD — expands in the center ──────────────────── */}
      <MemoryHUD
        sessionId={sessionId}
        refreshToken={refreshToken}
        onSessionReset={onSessionReset}
      />

      {/* Spacer — pushes keyboard hint to the right */}
      <span style={{ flex: 1 }} aria-hidden="true" />

      {/* Keyboard shortcut hint */}
      <span
        style={{
          fontSize: "11px",
          color: "var(--text-tertiary)",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        <kbd
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: "16px",
            padding: "0 4px",
            fontSize: "10px",
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            color: "var(--text-tertiary)",
            backgroundColor: "var(--surface-raised)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-xs)",
            lineHeight: 1,
          }}
        >
          ⌘K
        </kbd>
        <span>Command palette</span>
      </span>
    </footer>
  );
}
