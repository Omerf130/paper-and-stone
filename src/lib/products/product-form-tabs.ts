export const PRODUCT_FORM_TAB_ORDER = [
  "general",
  "media",
  "materials",
  "technical",
  "pricing",
] as const;

export type ProductFormTabId = (typeof PRODUCT_FORM_TAB_ORDER)[number];

export const PRODUCT_FORM_TAB_LABELS: Record<ProductFormTabId, string> = {
  general: "מידע כללי",
  media: "מדיה",
  materials: "חומרים ואפשרויות",
  technical: "מידע טכני",
  pricing: "תמחור",
};

const GENERAL_FIELDS = new Set([
  "nameHe",
  "nameEn",
  "slug",
  "sku",
  "shortDescription",
  "longDescription",
  "brand",
  "designer",
  "categoryId",
  "supplierId",
  "isActive",
  "isFeatured",
  "internalCatalogName",
  "catalogCode",
]);

const MATERIALS_PREFIXES = ["materialOptions", "sizes"];

const TECHNICAL_FIELDS = new Set([
  "width",
  "depth",
  "height",
  "seatHeight",
  "materials",
  "maintenance",
  "warranty",
  "countryOfOrigin",
  "documents",
]);

const PRICING_FIELDS = new Set(["defaultInternalCostShekels"]);

function matchesPrefix(fieldKey: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => fieldKey === prefix || fieldKey.startsWith(`${prefix}.`),
  );
}

export function resolveProductFormTabForFieldError(
  fieldKey: string,
): ProductFormTabId {
  const rootField = fieldKey.split(".")[0] ?? fieldKey;

  if (GENERAL_FIELDS.has(rootField)) {
    return "general";
  }

  if (matchesPrefix(fieldKey, MATERIALS_PREFIXES)) {
    return "materials";
  }

  if (TECHNICAL_FIELDS.has(rootField) || matchesPrefix(fieldKey, ["documents"])) {
    return "technical";
  }

  if (PRICING_FIELDS.has(rootField)) {
    return "pricing";
  }

  return "general";
}

export function resolveFirstTabWithErrors(
  fieldErrors: Record<string, string>,
): ProductFormTabId | null {
  for (const tabId of PRODUCT_FORM_TAB_ORDER) {
    const hasError = Object.keys(fieldErrors).some(
      (fieldKey) => resolveProductFormTabForFieldError(fieldKey) === tabId,
    );

    if (hasError) {
      return tabId;
    }
  }

  return null;
}

export function getTabsWithErrors(
  fieldErrors: Record<string, string>,
): Set<ProductFormTabId> {
  const tabs = new Set<ProductFormTabId>();

  for (const fieldKey of Object.keys(fieldErrors)) {
    tabs.add(resolveProductFormTabForFieldError(fieldKey));
  }

  return tabs;
}
