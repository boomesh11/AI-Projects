/**
 * Session memory types — mirrors the FastAPI backend's SessionContext
 * and the compact context dict returned by /session/{id}/context.
 *
 * Two shapes are needed:
 *   SessionContextFull   — full session state (GET /session/{id})
 *   SessionContextSummary — compact AI-facing dict (GET /session/{id}/context)
 */

/** Full session state — mirrors SessionContextResponse Pydantic schema. */
export interface SessionContextFull {
  session_id: string;
  recent_intents: string[];
  extracted_entities: Record<string, unknown>;
  active_employee: string | null;
  active_project: string | null;
  current_workspace: string | null;
  command_history: string[];
  last_updated: number;
}

/** Compact context summary — mirrors MemoryService.current_context() output. */
export interface SessionContextSummary {
  has_context: boolean;
  active_employee: string | null;
  active_project: string | null;
  current_workspace: string | null;
  recent_intents: string[];
  recent_entities: Record<string, unknown>;
  command_count: number;
  last_command: string | null;
}

/** Confirmation response for DELETE /session/{id}. */
export interface SessionClearedResponse {
  session_id: string;
  cleared: boolean;
  message: string;
}
