"use client";

/**
 * Tooltip — Accessible hover tooltip.
 *
 * Wraps any element and shows a tooltip on hover/focus.
 * Position: above the target by default.
 *
 * Client Component: requires mouse and focus event handlers.
 *
 * Accessibility notes:
 * - Uses role="tooltip" on the tooltip element
 * - Associates via aria-describedby on the trigger
 * - Keyboard accessible (focus triggers tooltip)
 */

import { useState, useId } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom";
}

export default function Tooltip({
  content,
  children,
  position = "top",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();

  const tooltipStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 100,
    left: "50%",
    transform: "translateX(-50%)",
    ...(position === "top"
      ? { bottom: "calc(100% + 6px)" }
      : { top: "calc(100% + 6px)" }),
    backgroundColor: "var(--stone-900)",
    color: "#FFFFFF",
    fontSize: "11px",
    fontWeight: 400,
    lineHeight: 1.4,
    padding: "5px 8px",
    borderRadius: "var(--radius-xs)",
    whiteSpace: "nowrap",
    pointerEvents: "none",
    opacity: visible ? 1 : 0,
    transition: "opacity var(--transition-fast)",
    boxShadow: "var(--shadow-sm)",
  };

  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {/* Trigger — clone children with aria-describedby */}
      <span aria-describedby={visible ? tooltipId : undefined}>
        {children}
      </span>

      {/* Tooltip panel */}
      <span
        id={tooltipId}
        role="tooltip"
        style={tooltipStyle}
      >
        {content}
      </span>
    </span>
  );
}
