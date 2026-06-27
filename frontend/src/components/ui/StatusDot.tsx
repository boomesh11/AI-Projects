/**
 * StatusDot — An 8px colored circle communicating item status.
 *
 * Used as the leftmost element in every workspace row. Color maps
 * directly to semantic status CSS tokens — never hardcoded.
 *
 * Server Component.
 */

export type StatusDotVariant =
  | "active"
  | "blocked"
  | "review"
  | "done"
  | "idle";

const STATUS_COLOR: Record<StatusDotVariant, string> = {
  active:  "var(--status-active)",
  blocked: "var(--status-blocked)",
  review:  "var(--status-review)",
  done:    "var(--status-done)",
  idle:    "var(--status-idle)",
} as const;

const STATUS_LABEL: Record<StatusDotVariant, string> = {
  active:  "Active",
  blocked: "Blocked",
  review:  "In review",
  done:    "Done",
  idle:    "Idle",
} as const;

interface StatusDotProps {
  variant: StatusDotVariant;
  /** Override the accessible label. Defaults to the variant name. */
  label?: string;
  size?: 6 | 8 | 10;
}

export default function StatusDot({
  variant,
  label,
  size = 8,
}: StatusDotProps) {
  return (
    <span
      role="img"
      aria-label={label ?? STATUS_LABEL[variant]}
      style={{
        display: "inline-block",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "var(--radius-full)",
        backgroundColor: STATUS_COLOR[variant],
        flexShrink: 0,
      }}
    />
  );
}
