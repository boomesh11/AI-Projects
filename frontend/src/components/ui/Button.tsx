/**
 * Button — Primary interactive element.
 *
 * Variants:
 * - "primary"     — amber fill, primary actions
 * - "secondary"   — bordered, secondary actions
 * - "ghost"       — text only, tertiary actions
 * - "destructive" — red, destructive/irreversible actions
 *
 * Sizes: sm | md | lg
 *
 * Client Component: requires onClick handler support and hover state.
 * Interactive hover is handled via onMouse* events to avoid CSS Modules.
 */
"use client";

import { type ButtonHTMLAttributes, useState } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonStyleConfig {
  base: React.CSSProperties;
  hover: React.CSSProperties;
}

const VARIANT_STYLES: Record<ButtonVariant, ButtonStyleConfig> = {
  primary: {
    base: {
      backgroundColor: "var(--accent)",
      color: "#FFFFFF",
      border: "1px solid var(--accent)",
    },
    hover: {
      backgroundColor: "var(--accent-hover)",
      border: "1px solid var(--accent-hover)",
    },
  },
  secondary: {
    base: {
      backgroundColor: "transparent",
      color: "var(--text-primary)",
      border: "1px solid var(--border-default)",
    },
    hover: {
      backgroundColor: "var(--surface-raised)",
    },
  },
  ghost: {
    base: {
      backgroundColor: "transparent",
      color: "var(--text-secondary)",
      border: "1px solid transparent",
    },
    hover: {
      backgroundColor: "var(--surface-raised)",
      color: "var(--text-primary)",
    },
  },
  destructive: {
    base: {
      backgroundColor: "transparent",
      color: "var(--status-blocked)",
      border: "1px solid var(--border-default)",
    },
    hover: {
      backgroundColor: "var(--red-50)",
      borderColor: "var(--status-blocked)",
    },
  },
};

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  sm: { height: "28px", padding: "0 10px", fontSize: "12px", fontWeight: 500 },
  md: { height: "32px", padding: "0 14px", fontSize: "13px", fontWeight: 500 },
  lg: { height: "38px", padding: "0 18px", fontSize: "14px", fontWeight: 500 },
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

export default function Button({
  variant = "secondary",
  size = "md",
  children,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const variantConfig = VARIANT_STYLES[variant];
  const computedStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    borderRadius: "var(--radius-sm)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: `background-color var(--transition-base), border-color var(--transition-base), color var(--transition-base)`,
    whiteSpace: "nowrap",
    userSelect: "none",
    lineHeight: 1,
    fontFamily: "var(--font-sans)",
    ...variantConfig.base,
    ...SIZE_STYLES[size],
    ...(isHovered && !disabled ? variantConfig.hover : {}),
    ...style,
  };

  return (
    <button
      type="button"
      disabled={disabled}
      style={computedStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </button>
  );
}
