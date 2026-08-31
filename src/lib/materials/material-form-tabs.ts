export const MATERIAL_FORM_TAB_ORDER = [
  "general",
  "variants",
  "library",
] as const;

export type MaterialFormTabId = (typeof MATERIAL_FORM_TAB_ORDER)[number];

export const MATERIAL_FORM_TAB_LABELS: Record<MaterialFormTabId, string> = {
  general: "מידע כללי",
  variants: "וריאנטים",
  library: "ספריה",
};

const GENERAL_FIELDS = new Set(["nameEn", "code", "type", "isActive"]);

function matchesPrefix(fieldKey: string, prefix: string): boolean {
  return fieldKey === prefix || fieldKey.startsWith(`${prefix}.`);
}

export function resolveMaterialFormTabForFieldError(
  fieldKey: string,
): MaterialFormTabId {
  const rootField = fieldKey.split(".")[0] ?? fieldKey;

  if (GENERAL_FIELDS.has(rootField)) {
    return "general";
  }

  if (matchesPrefix(fieldKey, "variants")) {
    return "variants";
  }

  return "general";
}

export function resolveFirstTabWithErrors(
  fieldErrors: Record<string, string>,
): MaterialFormTabId | null {
  for (const tabId of MATERIAL_FORM_TAB_ORDER) {
    const hasError = Object.keys(fieldErrors).some(
      (fieldKey) => resolveMaterialFormTabForFieldError(fieldKey) === tabId,
    );

    if (hasError) {
      return tabId;
    }
  }

  return null;
}

export function getTabsWithErrors(
  fieldErrors: Record<string, string>,
): Set<MaterialFormTabId> {
  const tabs = new Set<MaterialFormTabId>();

  for (const fieldKey of Object.keys(fieldErrors)) {
    tabs.add(resolveMaterialFormTabForFieldError(fieldKey));
  }

  return tabs;
}
