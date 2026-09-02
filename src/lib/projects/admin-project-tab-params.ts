export const ADMIN_PROJECT_TAB_IDS = [
  "summary",
  "costs",
  "payments",
  "import",
  "history",
] as const;

export type AdminProjectTabId = (typeof ADMIN_PROJECT_TAB_IDS)[number];

export const ADMIN_PROJECT_TAB_LABELS: Record<AdminProjectTabId, string> = {
  summary: "סיכום",
  costs: "עלויות",
  payments: "תשלומים",
  import: "לוגיסטיקה",
  history: "היסטוריה",
};

export function isAdminProjectTabId(
  value: string | null | undefined,
): value is AdminProjectTabId {
  return ADMIN_PROJECT_TAB_IDS.includes(value as AdminProjectTabId);
}

export function resolveAdminProjectTabId(
  tabParam: string | string[] | undefined | null,
): AdminProjectTabId {
  const value = Array.isArray(tabParam) ? tabParam[0] : tabParam;
  if (value && isAdminProjectTabId(value)) {
    return value;
  }
  return "summary";
}
