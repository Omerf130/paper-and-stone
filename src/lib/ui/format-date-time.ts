export function formatDateTime(
  value?: string | null,
  fallback = "—",
): string {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
