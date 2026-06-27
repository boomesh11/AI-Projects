/**
 * Utility functions used across workspace components.
 */

/**
 * Formats an ISO date string into a human-readable relative time string.
 * Used for "due in 2h", "updated yesterday", "3 days ago" patterns.
 *
 * Note: This is a server-side utility. For real-time updates,
 * this would need a Client Component with useEffect.
 */
export function formatRelativeTime(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffDay < 14) return "last week";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Formats an ISO date string as a future relative time.
 * Used for "due in 2h", "due tomorrow", "due in 3 days" patterns.
 */
export function formatDueTime(isoDate: string): {
  label: string;
  isOverdue: boolean;
} {
  const now = new Date();
  const due = new Date(isoDate);
  const diffMs = due.getTime() - now.getTime();
  const diffMin = Math.floor(diffMs / 1000 / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMs < 0) {
    // Overdue
    const overdueDay = Math.floor(Math.abs(diffMs) / 1000 / 60 / 60 / 24);
    if (overdueDay === 0) return { label: "due today", isOverdue: true };
    if (overdueDay === 1) return { label: "1 day overdue", isOverdue: true };
    return { label: `${overdueDay} days overdue`, isOverdue: true };
  }

  if (diffHour < 1) return { label: `due in ${diffMin}m`, isOverdue: false };
  if (diffHour < 24) return { label: `due in ${diffHour}h`, isOverdue: false };
  if (diffDay === 1) return { label: "due tomorrow", isOverdue: false };
  if (diffDay < 7) return { label: `due in ${diffDay} days`, isOverdue: false };
  return {
    label: `due ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    isOverdue: false,
  };
}

/**
 * Returns the day group label for a timestamp.
 * Used to group activity entries in Pulse and People.
 */
export function getDayGroup(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const thisWeekStart = new Date(today.getTime() - today.getDay() * 86400000);
  const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 86400000);

  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (dateDay >= today) return "Today";
  if (dateDay >= yesterday) return "Yesterday";
  if (dateDay >= thisWeekStart) return "This Week";
  if (dateDay >= lastWeekStart) return "Last Week";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/**
 * Groups an array of items by a string key.
 * Used to group documents by recency and activity by day.
 */
export function groupBy<T>(
  items: T[],
  getKey: (item: T) => string
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = getKey(item);
    const existing = map.get(key);
    if (existing) {
      existing.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
}

/**
 * Returns the doc type badge variant key.
 */
export function getDocBadgeVariant(
  type: "brief" | "spec" | "report" | "notes"
): "doc-brief" | "doc-spec" | "doc-report" | "doc-notes" {
  return `doc-${type}` as const;
}

/**
 * Returns the status badge variant key.
 */
export function getStatusBadgeVariant(
  status: "active" | "blocked" | "review" | "done" | "idle"
): "status-active" | "status-blocked" | "status-review" | "status-done" | "status-idle" {
  return `status-${status}` as const;
}
