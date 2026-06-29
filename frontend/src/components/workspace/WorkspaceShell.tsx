/**
 * WorkspaceShell — Client-side orchestrator for the workspace canvas (v2).
 *
 * New in v2:
 *   - Owns the session ID (from sessionStorage via getSessionId())
 *   - Passes sessionId down to CommandBar for fetch calls
 *   - Increments refreshToken after each plan to trigger HUD refresh
 *   - Owns CatalystStrip here (moved from server layout) so it can
 *     receive sessionId and refreshToken as props
 *   - Handles session reset via MemoryHUD's onSessionReset callback
 *
 * Data flow:
 *   WorkspaceShell (sessionId, refreshToken)
 *     → CommandBar (sessionId)         [sends it with fetchPlan]
 *     → CatalystStrip (sessionId, refreshToken)
 *         → MemoryHUD (polls /session/{id}/context)
 */
"use client";

import { useState, useEffect } from "react";
import type { ExecutionPlan } from "@/lib/types/plan";
import CommandBar from "@/components/workspace/CommandBar";
import ActionRenderer from "@/components/workspace/ActionRenderer";
import CatalystStrip from "@/components/shell/CatalystStrip";
import { getSessionId } from "@/lib/session";

interface WorkspaceShellProps {
  children: React.ReactNode;
}

export default function WorkspaceShell({ children }: WorkspaceShellProps) {
  const [activePlan, setActivePlan] = useState<ExecutionPlan | null>(null);
  const [sessionId, setSessionId] = useState<string>("initializing");
  const [refreshToken, setRefreshToken] = useState<number>(0);

  // Initialise sessionId client-side (sessionStorage is browser-only)
  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  function handlePlan(plan: ExecutionPlan) {
    setActivePlan(plan);
    // Increment token → MemoryHUD re-fetches session context
    setRefreshToken((t) => t + 1);
  }

  function handleClose() {
    setActivePlan(null);
  }

  function handleSessionReset(newSessionId: string) {
    setSessionId(newSessionId);
    setActivePlan(null);
    setRefreshToken(0);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* ── Scrollable content region ── */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {/* ── Command Bar — always visible, padded independently ── */}
        <div
          style={{
            padding: "16px var(--canvas-padding-x) 0",
            maxWidth: "calc(var(--canvas-max-width) + (var(--canvas-padding-x) * 2))",
          }}
        >
          <CommandBar
            sessionId={sessionId}
            onPlan={handlePlan}
          />

          {/* ── Dynamic action — rendered when a plan is active ── */}
          {activePlan && (
            <div style={{ marginBottom: "8px" }}>
              <ActionRenderer plan={activePlan} onClose={handleClose} />
            </div>
          )}
        </div>

        {/* ── Page content — each page manages its own padding ── */}
        {children}
      </div>

      {/* ── Catalyst Strip — pinned to bottom of canvas ── */}
      <CatalystStrip
        sessionId={sessionId}
        refreshToken={refreshToken}
        onSessionReset={handleSessionReset}
      />
    </div>
  );
}
