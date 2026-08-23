export const ADMIN_PROJECT_ITEM_CARD_LAYERS = ["header", "pricing"] as const;

export const ADMIN_PROJECT_ITEM_HEADER_SECTIONS = [
  "product",
  "workflow",
] as const;

export const ADMIN_PROJECT_ITEM_PRICING_FIELDS = [
  "internal",
  "markup",
  "architect",
  "client",
] as const;

/** @deprecated Use ADMIN_PROJECT_ITEM_CARD_LAYERS */
export const ADMIN_PROJECT_ITEM_PRICING_ROW_SECTIONS = [
  "product",
  "status",
  "pricing",
  "actions",
] as const;

export type AdminProjectItemCardLayer =
  (typeof ADMIN_PROJECT_ITEM_CARD_LAYERS)[number];

export type AdminProjectItemHeaderSection =
  (typeof ADMIN_PROJECT_ITEM_HEADER_SECTIONS)[number];

export type AdminProjectItemPricingField =
  (typeof ADMIN_PROJECT_ITEM_PRICING_FIELDS)[number];
