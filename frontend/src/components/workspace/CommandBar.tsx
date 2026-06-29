/**
 * CommandBar — Natural language input for the Catalyst AI.
 *
 * Sits above the workspace canvas content. The user types a command,
 * presses Enter or clicks Send, and the bar calls the Planner API.
 * The returned ExecutionPlan is handed up to the parent via onPlan().
 *
 * Client Component: requires form state, keyboard events, and fetch.
 */
"use client";

import { useState, useRef } from "react";
import type { ExecutionPlan } from "@/lib/types/plan";
import { fetchPlan } from "@/lib/api/catalyst";

interface CommandBarProps {
  /** Tab-scoped session identifier — threads through to the backend. */
  sessionId: string;
  /** Called when the Planner returns a valid execution plan. */
  onPlan: (plan: ExecutionPlan) => void;
}

export default function CommandBar({ sessionId, onPlan }: CommandBarProps) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const plan = await fetchPlan(trimmed, sessionId);
      onPlan(plan);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reach Catalyst API");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div style={{ marginBottom: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--surface-overlay)",
          padding: "4px 4px 4px 14px",
          transition: "border-color var(--transition-base), box-shadow var(--transition-base)",
          boxShadow: "var(--shadow-xs)",
        }}
        onFocus={() => {
          const el = inputRef.current?.parentElement;
          if (el) {
            el.style.borderColor = "var(--accent)";
            el.style.boxShadow = "0 0 0 3px var(--accent-muted)";
          }
        }}
        onBlur={() => {
          const el = inputRef.current?.parentElement;
          if (el) {
            el.style.borderColor = "var(--border-default)";
            el.style.boxShadow = "var(--shadow-xs)";
          }
        }}
      >
        {/* Catalyst logomark in input */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0, opacity: 0.4 }}
        >
          <path
            d="M11 4C10.1 2.8 8.65 2 7 2C4.24 2 2 4.24 2 7C2 9.76 4.24 12 7 12C8.65 12 10.1 11.2 11 10"
            stroke="var(--text-primary)"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>

        <input
          ref={inputRef}
          id="catalyst-command-bar"
          type="text"
          placeholder="Ask Catalyst anything…"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          autoComplete="off"
          style={{
            flex: 1,
            height: "34px",
            border: "none",
            outline: "none",
            backgroundColor: "transparent",
            fontSize: "14px",
            color: "var(--text-primary)",
            fontFamily: "var(--font-sans)",
          }}
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          aria-label="Send command"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "34px",
            height: "34px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: text.trim() ? "var(--accent)" : "transparent",
            border: "none",
            cursor: text.trim() && !isLoading ? "pointer" : "default",
            opacity: text.trim() ? 1 : 0.35,
            transition: "background-color var(--transition-base), opacity var(--transition-base)",
            flexShrink: 0,
          }}
        >
          {isLoading ? (
            /* Spinner */
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              style={{ animation: "spin 0.8s linear infinite" }}
            >
              <circle
                cx="7"
                cy="7"
                r="5.5"
                stroke="var(--text-tertiary)"
                strokeWidth="1.5"
                strokeDasharray="28"
                strokeDashoffset="8"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            /* Send arrow */
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8H13M13 8L9 4M13 8L9 12"
                stroke={text.trim() ? "#FFFFFF" : "var(--text-tertiary)"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p
          style={{
            marginTop: "6px",
            fontSize: "12px",
            color: "var(--status-blocked)",
            paddingLeft: "14px",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
