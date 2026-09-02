const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

export function formatRelativeTime(
  value?: string | null,
  fallback = "—",
): string {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / MINUTE_MS);

  if (diffMinutes < 1) {
    return "עכשיו";
  }

  if (diffMinutes < 60) {
    return diffMinutes === 1 ? "לפני דקה" : `לפני ${diffMinutes} דקות`;
  }

  const diffHours = Math.floor(diffMs / HOUR_MS);
  if (diffHours < 24) {
    return diffHours === 1 ? "לפני שעה" : `לפני ${diffHours} שעות`;
  }

  const diffDays = Math.floor(diffMs / DAY_MS);
  if (diffDays < 7) {
    return diffDays === 1 ? "אתמול" : `לפני ${diffDays} ימים`;
  }

  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "short",
  }).format(date);
}
