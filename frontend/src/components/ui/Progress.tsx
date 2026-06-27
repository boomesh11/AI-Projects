/**
 * Progress — Thin horizontal progress bar.
 *
 * Used on project rows to show completion percentage.
 * Animated fill on mount is handled via CSS transition.
 *
 * Accessible: uses role="progressbar" with aria-valuenow.
 *
 * Server Component.
 */

interface ProgressProps {
  /** Value from 0 to 100 */
  value: number;
  /** Accessible label e.g. "Project Alpha: 65% complete" */
  label?: string;
  height?: 2 | 3 | 4;
  color?: "accent" | "active" | "review" | "blocked";
}

const COLOR_MAP: Record<NonNullable<ProgressProps["color"]>, string> = {
  accent:  "var(--accent)",
  active:  "var(--status-active)",
  review:  "var(--status-review)",
  blocked: "var(--status-blocked)",
};

export default function Progress({
  value,
  label,
  height = 3,
  color = "accent",
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${clamped}% complete`}
      style={{
        width: "100%",
        height: `${height}px`,
        backgroundColor: "var(--surface-inset)",
        borderRadius: "var(--radius-full)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${clamped}%`,
          backgroundColor: COLOR_MAP[color],
          borderRadius: "var(--radius-full)",
          transition: "width 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </div>
  );
}
