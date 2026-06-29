/**
 * Badge — Pill-shaped label communicating type, priority, or status.
 *
 * Three variant families:
 * - "status" — mirrors StatusDot semantics for inline use
 * - "priority" — high / medium / low work priority
 * - "doc" — document type (brief, spec, report, notes)
 *
 * Server Component.
 */

export type BadgeVariant =
  // Status variants
  | "status-active"
  | "status-blocked"
  | "status-review"
  | "status-done"
  | "status-idle"
  // Priority variants
  | "priority-high"
  | "priority-medium"
  | "priority-low"
  // Document type variants
  | "doc-brief"
  | "doc-spec"
  | "doc-report"
  | "doc-notes";

interface BadgeConfig {
  label: string;
  color: string;
  background: string;
}

const BADGE_CONFIG: Record<BadgeVariant, BadgeConfig> = {
  "status-active":  { label: "Active",     color: "var(--status-active)",  background: "var(--green-50)" },
  "status-blocked": { label: "Blocked",    color: "var(--status-blocked)", background: "var(--red-50)" },
  "status-review":  { label: "In Review",  color: "var(--status-review)",  background: "var(--amber-50)" },
  "status-done":    { label: "Done",       color: "var(--status-done)",    background: "var(--surface-inset)" },
  "status-idle":    { label: "Idle",       color: "var(--status-idle)",    background: "var(--surface-inset)" },

  "priority-high":   { label: "High",    color: "var(--red-700)",    background: "var(--red-50)" },
  "priority-medium": { label: "Medium",  color: "var(--amber-700)",  background: "var(--amber-50)" },
  "priority-low":    { label: "Low",     color: "var(--stone-600)",  background: "var(--surface-inset)" },

  "doc-brief":  { label: "Brief",  color: "var(--doc-brief)",  background: "var(--blue-50)" },
  "doc-spec":   { label: "Spec",   color: "var(--doc-spec)",   background: "var(--violet-50)" },
  "doc-report": { label: "Report", color: "var(--doc-report)", background: "var(--amber-50)" },
  "doc-notes":  { label: "Notes",  color: "var(--doc-notes)",  background: "var(--surface-inset)" },
} as const;

interface BadgeProps {
  variant: BadgeVariant;
  /** Override the default label text */
  children?: string;
}

export default function Badge({ variant, children }: BadgeProps) {
  const normalizedVariant = (variant?.toLowerCase() ?? "priority-medium") as BadgeVariant;
  const config = BADGE_CONFIG[normalizedVariant] ?? BADGE_CONFIG["priority-medium"];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: "20px",
        padding: "0 7px",
        borderRadius: "var(--radius-full)",
        fontSize: "11px",
        fontWeight: 500,
        lineHeight: 1,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        color: config.color,
        backgroundColor: config.background,
        flexShrink: 0,
      }}
    >
      {children ?? config.label}
    </span>
  );
}
