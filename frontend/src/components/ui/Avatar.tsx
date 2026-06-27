/**
 * Avatar — User identity component with initials fallback.
 *
 * Displays a circular avatar. If no image src is provided (or image fails),
 * falls back to initials derived from the name prop.
 *
 * Supports stacking: use AvatarGroup for overlapping multi-user displays.
 *
 * Server Component — no state, no effects.
 */

export type AvatarSize = "xs" | "sm" | "md" | "lg";

const SIZE_PX: Record<AvatarSize, number> = {
  xs: 20,
  sm: 24,
  md: 32,
  lg: 40,
};

const FONT_SIZE: Record<AvatarSize, string> = {
  xs: "9px",
  sm: "10px",
  md: "12px",
  lg: "14px",
};

/**
 * Returns up to 2 uppercase initials from a name string.
 * "Alex Chen" → "AC", "Jordan" → "J"
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Deterministic background color from name — avoids all avatars being
 * the same color in a group without requiring a stored color value.
 */
const AVATAR_COLORS = [
  { bg: "#E2E8F0", text: "#475569" }, // slate
  { bg: "#FEF3C7", text: "#92400E" }, // amber
  { bg: "#F0FDF4", text: "#15803D" }, // green
  { bg: "#EFF6FF", text: "#1D4ED8" }, // blue
  { bg: "#F5F3FF", text: "#6D28D9" }, // violet
  { bg: "#FFF1F2", text: "#B91C1C" }, // red
] as const;

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
}

export function Avatar({ name, src, size = "md" }: AvatarProps) {
  const px = SIZE_PX[size];
  const color = getAvatarColor(name);

  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${px}px`,
        height: `${px}px`,
        borderRadius: "var(--radius-full)",
        backgroundColor: src ? "transparent" : color.bg,
        border: "1.5px solid var(--surface-base)",
        overflow: "hidden",
        flexShrink: 0,
        fontSize: FONT_SIZE[size],
        fontWeight: 600,
        color: color.text,
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      {src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}

/**
 * AvatarGroup — displays up to `max` avatars in an overlapping stack.
 * Overflow is shown as "+N" with the same avatar styling.
 */
interface AvatarGroupProps {
  names: string[];
  size?: AvatarSize;
  max?: number;
}

export function AvatarGroup({ names, size = "sm", max = 3 }: AvatarGroupProps) {
  const visible = names.slice(0, max);
  const overflow = names.length - visible.length;

  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "row-reverse",
      }}
      aria-label={`${names.length} people: ${names.join(", ")}`}
    >
      {overflow > 0 && (
        <span
          aria-label={`${overflow} more`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: `${SIZE_PX[size]}px`,
            height: `${SIZE_PX[size]}px`,
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--surface-inset)",
            border: "1.5px solid var(--surface-base)",
            fontSize: FONT_SIZE[size],
            fontWeight: 600,
            color: "var(--text-secondary)",
            lineHeight: 1,
            marginLeft: "-6px",
            flexShrink: 0,
          }}
        >
          +{overflow}
        </span>
      )}
      {[...visible].reverse().map((name, i) => (
        <span
          key={name}
          style={{ marginLeft: i < visible.length - 1 ? "-6px" : 0 }}
        >
          <Avatar name={name} size={size} />
        </span>
      ))}
    </span>
  );
}
