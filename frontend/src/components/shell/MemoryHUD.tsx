/**
 * MemoryHUD — Ambient session memory display in CatalystStrip.
 *
 * Shows what the AI currently "knows" about the session:
 *   👤 Rahul       ← active_employee pill
 *   📁 Apollo      ← active_project pill
 *   3 commands     ← command count
 *
 * Refreshes after every command by accepting a `refreshToken` prop
 * that increments whenever WorkspaceShell processes a new plan.
 *
 * The × button clears the backend session and generates a fresh
 * session ID on the frontend so the next command starts clean.
 *
 * Client Component: requires fetch + state.
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import type { SessionContextSummary } from "@/lib/types/session";
import { fetchSessionContext, clearSession } from "@/lib/api/catalyst";
import { resetSession } from "@/lib/session";

interface MemoryHUDProps {
  sessionId: string;
  /** Increment this to trigger a context refresh after a new command. */
  refreshToken: number;
  /** Called with the new session ID after the user clears context. */
  onSessionReset: (newSessionId: string) => void;
}

// Pill styles helper
function Pill({
  icon,
  label,
  color,
}: {
  icon: string;
  label: string;
  color: "amber" | "blue";
}) {
  const bg = color === "amber" ? "var(--accent-muted)" : "rgba(59,130,246,0.12)";
  const border =
    color === "amber" ? "var(--border-accent)" : "rgba(59,130,246,0.35)";
  const text =
    color === "amber" ? "var(--text-accent)" : "rgba(96,165,250,1)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 8px",
        borderRadius: "var(--radius-full)",
        backgroundColor: bg,
        border: `1px solid ${border}`,
        fontSize: "11px",
        fontWeight: 500,
        color: text,
        lineHeight: 1,
        whiteSpace: "nowrap",
        animation: "catalystFadeIn 0.3s ease both",
      }}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}

export default function MemoryHUD({
  sessionId,
  refreshToken,
  onSessionReset,
}: MemoryHUDProps) {
  const [context, setContext] = useState<SessionContextSummary | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const ctx = await fetchSessionContext(sessionId);
      setContext(ctx);
    } catch {
      // Silently fail — HUD is ambient, not critical
    }
  }, [sessionId]);

  // Refresh on mount and whenever refreshToken changes (new command processed)
  useEffect(() => {
    refresh();
  }, [refresh, refreshToken]);

  async function handleClear() {
    if (isClearing) return;
    setIsClearing(true);
    try {
      await clearSession(sessionId);
      const newId = resetSession();
      setContext(null);
      onSessionReset(newId);
    } catch {
      // Ignore clear errors — worst case: stale HUD until next command
    } finally {
      setIsClearing(false);
    }
  }

  const hasContext = context?.has_context ?? false;
  const commandCount = context?.command_count ?? 0;

  if (!hasContext && commandCount === 0) {
    // No context yet — render nothing (HUD only appears once there's context)
    return null;
  }

  return (
    <div
      role="status"
      aria-label="Session memory context"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        animation: "catalystFadeIn 0.4s ease both",
      }}
    >
      {/* Separator */}
      <span
        aria-hidden="true"
        style={{
          width: "1px",
          height: "12px",
          backgroundColor: "var(--border-default)",
          marginRight: "2px",
        }}
      />

      {/* Active employee pill */}
      {context?.active_employee && (
        <Pill icon="👤" label={context.active_employee} color="amber" />
      )}

      {/* Active project pill */}
      {context?.active_project && (
        <Pill icon="📁" label={context.active_project} color="blue" />
      )}

      {/* Command count badge */}
      {commandCount > 0 && (
        <span
          style={{
            fontSize: "11px",
            color: "var(--text-tertiary)",
            whiteSpace: "nowrap",
          }}
        >
          {commandCount} {commandCount === 1 ? "command" : "commands"}
        </span>
      )}

      {/* Clear session button */}
      <button
        type="button"
        onClick={handleClear}
        disabled={isClearing}
        aria-label="Clear session memory"
        title="Clear session — start fresh"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "16px",
          height: "16px",
          borderRadius: "var(--radius-full)",
          backgroundColor: "transparent",
          border: "1px solid var(--border-default)",
          color: "var(--text-tertiary)",
          fontSize: "9px",
          cursor: isClearing ? "default" : "pointer",
          opacity: isClearing ? 0.4 : 1,
          transition: "opacity var(--transition-base), background-color var(--transition-base)",
          flexShrink: 0,
          padding: 0,
          lineHeight: 1,
        }}
        onMouseEnter={(e) => {
          if (!isClearing) {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              "var(--surface-raised)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
          (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
        }}
      >
        ×
      </button>
    </div>
  );
}
