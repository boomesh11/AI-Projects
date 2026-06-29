/**
 * Catalyst API — ExecutionPlan types.
 *
 * Mirrors the FastAPI backend's ExecutionPlan Pydantic model.
 * Used across workspace components for type-safe plan handling.
 */

export interface ToolResult {
  success: boolean;
  message: string;
  data: Record<string, any>;
  refresh: string[];
}

export interface ExecutionPlan {
  intent: string;
  steps: string[];
  ui_action: string;
  tool: string;
  entities?: Record<string, string>;
  question?: string;
  tool_result?: ToolResult;
}
