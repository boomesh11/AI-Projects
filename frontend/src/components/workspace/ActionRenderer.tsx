/**
 * ActionRenderer — Maps ui_action strings to React components.
 *
 * This is the dynamic dispatch layer between the Planner Engine's
 * ExecutionPlan and the React component tree. Each ui_action maps
 * to a concrete component; unknown actions render a fallback.
 *
 * To add a new action, register its component in ACTION_COMPONENTS.
 *
 * Client Component: renders dynamically based on runtime plan data.
 */
"use client";

import { useEffect } from "react";
import type { ExecutionPlan, ToolResult } from "@/lib/types/plan";
import EmployeeForm from "@/components/workspace/EmployeeForm";
import ProjectForm from "@/components/workspace/ProjectForm";

interface ActionRendererProps {
  plan: ExecutionPlan;
  onClose: () => void;
}

/**
 * Registry of ui_action → component.
 * Extend this record as new actions are implemented.
 */
function renderAction(plan: ExecutionPlan, onClose: () => void): React.ReactNode {
  switch (plan.ui_action) {
    case "open_employee_form":
      return <EmployeeForm plan={plan} onClose={onClose} />;
    
    case "open_project_form":
      return <ProjectForm plan={plan} onClose={onClose} />;

    case "ask_clarification":
      return <ClarificationAction plan={plan} onClose={onClose} />;

    case "show_tool_result":
      if (plan.tool_result) {
        return <ToolResultAction plan={plan} result={plan.tool_result} onClose={onClose} />;
      }
      return <FallbackAction plan={plan} onClose={onClose} />;

    default:
      return <FallbackAction plan={plan} onClose={onClose} />;
  }
}

/** Rendered when the Brain requires clarification from the user. */
function ClarificationAction({ plan, onClose }: { plan: ExecutionPlan; onClose: () => void }) {
  return (
    <div style={{ padding: "32px 24px", textAlign: "center", backgroundColor: "var(--surface-sunken)" }}>
      <p
        style={{
          fontSize: "15px",
          color: "var(--text-primary)",
          marginBottom: "16px",
          fontWeight: 500,
        }}
      >
        🤔 {plan.question || "I need more information to proceed."}
      </p>
      <button
        type="button"
        onClick={onClose}
        style={{
          fontSize: "13px",
          color: "var(--text-accent)",
          background: "none",
          border: "none",
          cursor: "pointer",
          textDecoration: "underline",
          textUnderlineOffset: "3px",
        }}
      >
        Dismiss
      </button>
    </div>
  );
}

/** Rendered when the backend automatically executed the action and returned a ToolResult. */
function ToolResultAction({ plan, result, onClose }: { plan: ExecutionPlan; result: ToolResult; onClose: () => void }) {
  useEffect(() => {
    // Automatically dispatch refresh events for any affected domains
    if (result.success && result.refresh && result.refresh.length > 0) {
      result.refresh.forEach((domain) => {
        // e.g. "employees" -> dispatch "employeeCreated" (matching existing app logic)
        if (domain === "employees") {
          window.dispatchEvent(new Event("employeeCreated"));
        } else if (domain === "projects") {
          window.dispatchEvent(new Event("projectCreated"));
        }
      });
    }
  }, [result]);

  return (
    <div style={{ padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", backgroundColor: "var(--surface-sunken)" }}>
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "var(--radius-full)",
          backgroundColor: result.success ? "var(--green-50)" : "var(--status-blocked)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {result.success ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13L9 17L19 7" stroke="var(--status-active)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <p style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)" }}>
        {result.success ? "Action Completed" : "Action Failed"}
      </p>
      
      <p style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center", maxWidth: "320px", lineHeight: 1.5 }}>
        {result.message}
      </p>

      <button
        type="button"
        onClick={onClose}
        style={{
          marginTop: "8px",
          padding: "8px 16px",
          fontSize: "13px",
          color: "var(--text-inverse)",
          backgroundColor: "var(--accent)",
          border: "none",
          borderRadius: "var(--radius-sm)",
          cursor: "pointer",
        }}
      >
        Done
      </button>
    </div>
  );
}

/** Shown when the Planner returns an action we haven't implemented yet. */
function FallbackAction({ plan, onClose }: { plan: ExecutionPlan; onClose: () => void }) {
  return (
    <div style={{ padding: "32px 24px", textAlign: "center" }}>
      <p
        style={{
          fontSize: "14px",
          color: "var(--text-secondary)",
          marginBottom: "8px",
        }}
      >
        Action <strong style={{ color: "var(--text-primary)" }}>{plan.ui_action}</strong> is not yet implemented.
      </p>
      <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "16px" }}>
        Intent: {plan.intent} · Tool: {plan.tool}
      </p>
      <button
        type="button"
        onClick={onClose}
        style={{
          fontSize: "13px",
          color: "var(--text-accent)",
          background: "none",
          border: "none",
          cursor: "pointer",
          textDecoration: "underline",
          textUnderlineOffset: "3px",
        }}
      >
        Dismiss
      </button>
    </div>
  );
}

export default function ActionRenderer({ plan, onClose }: ActionRendererProps) {
  return (
    <div
      style={{
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        backgroundColor: "var(--surface-overlay)",
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
        animation: "catalystSlideIn var(--transition-enter) both",
      }}
    >
      {renderAction(plan, onClose)}
    </div>
  );
}
