/**
 * Catalyst API Client — v2 (Session-Aware)
 *
 * All backend communication flows through this module.
 * Network concerns are isolated here; components never call fetch directly.
 *
 * Changes in v2
 * -------------
 * - fetchPlan() now accepts a sessionId and sends it as a query param
 * - fetchSessionContext() — poll compact session state for the MemoryHUD
 * - clearSession() — DELETE /session/{id} to reset context
 *
 * Base URL defaults to localhost:8000 for development.
 */

import type { ExecutionPlan } from "@/lib/types/plan";
import type {
  SessionContextSummary,
  SessionClearedResponse,
} from "@/lib/types/session";

const API_BASE =
  process.env.NEXT_PUBLIC_CATALYST_API_URL ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Plan endpoint
// ---------------------------------------------------------------------------

/**
 * Fetch an execution plan from the Catalyst Planner Engine.
 *
 * Flow: User text + session_id → /plan → IntentEngine → Planner → ExecutionPlan
 *
 * @param text      Natural language input from the user.
 * @param sessionId Tab-scoped session identifier from session.ts.
 * @returns The structured execution plan (includes session_id + memory_enriched).
 * @throws Error if the network request fails or returns non-OK status.
 */
export async function fetchPlan(
  text: string,
  sessionId: string
): Promise<ExecutionPlan> {
  const url = new URL(`${API_BASE}/plan`);
  url.searchParams.set("text", text);
  url.searchParams.set("session_id", sessionId);

  const response = await fetch(url.toString());

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      body?.detail ??
        `Catalyst API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<ExecutionPlan>;
}

// ---------------------------------------------------------------------------
// Session memory endpoints
// ---------------------------------------------------------------------------

/**
 * Fetch the compact session context summary the AI currently sees.
 *
 * This endpoint never returns 404 — an empty context is returned when
 * no session exists yet, so polling is safe from the very first render.
 *
 * @param sessionId Session identifier.
 * @returns Compact SessionContextSummary dict.
 */
export async function fetchSessionContext(
  sessionId: string
): Promise<SessionContextSummary> {
  const url = `${API_BASE}/session/${encodeURIComponent(sessionId)}/context`;

  const response = await fetch(url);

  if (!response.ok) {
    // Return an empty context rather than throwing — HUD should degrade gracefully
    return {
      has_context: false,
      active_employee: null,
      active_project: null,
      current_workspace: null,
      recent_intents: [],
      recent_entities: {},
      command_count: 0,
      last_command: null,
    };
  }

  return response.json() as Promise<SessionContextSummary>;
}

/**
 * Clear (delete) the session from the backend memory store.
 *
 * Called by the MemoryHUD reset button.  After this call the frontend
 * should also call resetSession() to get a fresh session ID.
 *
 * @param sessionId Session identifier to clear.
 * @returns Confirmation payload.
 */
export async function clearSession(
  sessionId: string
): Promise<SessionClearedResponse> {
  const url = `${API_BASE}/session/${encodeURIComponent(sessionId)}`;

  const response = await fetch(url, { method: "DELETE" });

  if (!response.ok) {
    throw new Error(
      `Failed to clear session: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<SessionClearedResponse>;
}
