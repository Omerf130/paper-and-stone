export const ADMIN_ICON_ACCENTS = [
  "sand",
  "sage",
  "blush",
  "blue",
  "gold",
  "neutral",
] as const;

export type AdminIconAccent = (typeof ADMIN_ICON_ACCENTS)[number];

export const ADMIN_ICON_SEMANTIC_ACCENTS = [
  "success",
  "warning",
  "info",
  "neutral",
  "danger",
] as const;

export type AdminIconSemanticAccent = (typeof ADMIN_ICON_SEMANTIC_ACCENTS)[number];

const ACCENT_CLASS_KEYS: Record<AdminIconAccent | AdminIconSemanticAccent, string> = {
  sand: "accentSand",
  sage: "accentSage",
  blush: "accentBlush",
  blue: "accentBlue",
  gold: "accentGold",
  neutral: "accentNeutral",
  success: "accentSemanticSuccess",
  warning: "accentSemanticWarning",
  info: "accentSemanticInfo",
  danger: "accentSemanticDanger",
};

export function getAdminIconAccentClass(
  styles: Record<string, string>,
  accent?: AdminIconAccent | AdminIconSemanticAccent,
): string | undefined {
  if (!accent) {
    return undefined;
  }

  const key = ACCENT_CLASS_KEYS[accent];
  return key ? styles[key] : undefined;
}

export function combineIconAccentClasses(
  baseClass: string,
  styles: Record<string, string>,
  accent?: AdminIconAccent | AdminIconSemanticAccent,
): string {
  const accentClass = getAdminIconAccentClass(styles, accent);
  return accentClass ? `${baseClass} ${accentClass}` : baseClass;
}
