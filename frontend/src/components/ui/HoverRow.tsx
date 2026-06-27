"use client";

/**
 * HoverRow — a generic interactive row wrapper.
 *
 * Provides hover state (background color shift) for list rows.
 * Extracted as a Client Component so parent pages can remain
 * Server Components while still having hover interactivity.
 *
 * Usage: wrap any row content with <HoverRow> in a Server Component.
 */

import { useState } from "react";

interface HoverRowProps {
  children: React.ReactNode;
  /** Additional styles applied to the wrapper */
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function HoverRow({ children, style, onClick }: HoverRowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); }
          : undefined
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? "var(--surface-raised)" : "var(--surface-overlay)",
        transition: "background-color var(--transition-base)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
