import type { CategoryKind } from "@/types/category-kind";

export type CatalogTaxonomyNodeDefinition = {
  taxonomyKey: string;
  slug: string;
  kind: CategoryKind;
  nameEn: string;
  nameHe: string;
  sortOrder: number;
  descriptionEn?: string;
  descriptionHe?: string;
  /** Slug of parent node within this definition */
  parentSlug?: string;
  /** When set, prefer updating an existing category with this slug instead of creating new */
  existingSlug?: string;
};

const DEPARTMENTS: CatalogTaxonomyNodeDefinition[] = [
  {
    taxonomyKey: "living",
    slug: "living",
    kind: "department",
    nameEn: "Living",
    nameHe: "מגורים",
    sortOrder: 10,
    descriptionEn: "Timeless furniture and refined pieces for the heart of the home.",
    descriptionHe: "ריהוט נצחי ופריטים מוקפדים ללב הבית.",
  },
  {
    taxonomyKey: "dining",
    slug: "dining",
    kind: "department",
    nameEn: "Dining",
    nameHe: "פינות אוכל",
    sortOrder: 20,
  },
  {
    taxonomyKey: "bedroom",
    slug: "bedroom",
    kind: "department",
    nameEn: "Bedroom",
    nameHe: "חדר שינה",
    sortOrder: 30,
  },
  {
    taxonomyKey: "lighting",
    slug: "lighting",
    kind: "department",
    nameEn: "Lighting",
    nameHe: "תאורה",
    sortOrder: 40,
  },
  {
    taxonomyKey: "outdoor",
    slug: "outdoor",
    kind: "department",
    nameEn: "Outdoor",
    nameHe: "חוץ",
    sortOrder: 50,
  },
  {
    taxonomyKey: "bath",
    slug: "bath",
    kind: "department",
    nameEn: "Bath",
    nameHe: "אמבטיה",
    sortOrder: 60,
  },
  {
    taxonomyKey: "materials",
    slug: "materials",
    kind: "department",
    nameEn: "Materials",
    nameHe: "חומרים",
    sortOrder: 70,
  },
  {
    taxonomyKey: "commercial",
    slug: "commercial",
    kind: "department",
    nameEn: "Commercial",
    nameHe: "מסחרי",
    sortOrder: 80,
  },
];

const LIVING_GROUPS: CatalogTaxonomyNodeDefinition[] = [
  {
    taxonomyKey: "living.seating",
    slug: "living-seating",
    kind: "group",
    parentSlug: "living",
    nameEn: "Seating",
    nameHe: "ישיבה",
    sortOrder: 10,
  },
  {
    taxonomyKey: "living.tables",
    slug: "living-tables",
    kind: "group",
    parentSlug: "living",
    nameEn: "Tables",
    nameHe: "שולחנות",
    sortOrder: 20,
  },
  {
    taxonomyKey: "living.storage-cabinets",
    slug: "living-storage-cabinets",
    kind: "group",
    parentSlug: "living",
    nameEn: "Storage & Cabinets",
    nameHe: "אחסון וארונות",
    sortOrder: 30,
  },
];

const LIVING_LEAVES: CatalogTaxonomyNodeDefinition[] = [
  {
    taxonomyKey: "living.seating.sofas",
    slug: "sofas",
    existingSlug: "sofas",
    kind: "leaf",
    parentSlug: "living-seating",
    nameEn: "Sofas",
    nameHe: "ספות",
    sortOrder: 10,
  },
  {
    taxonomyKey: "living.seating.sectionals",
    slug: "sectionals",
    kind: "leaf",
    parentSlug: "living-seating",
    nameEn: "Sectionals",
    nameHe: "ספות מודולריות",
    sortOrder: 20,
  },
  {
    taxonomyKey: "living.seating.armchairs",
    slug: "armchairs",
    kind: "leaf",
    parentSlug: "living-seating",
    nameEn: "Armchairs",
    nameHe: "כורסאות",
    sortOrder: 30,
  },
  {
    taxonomyKey: "living.seating.lounge-chairs",
    slug: "lounge-chairs",
    kind: "leaf",
    parentSlug: "living-seating",
    nameEn: "Lounge Chairs",
    nameHe: "כיסאות לאונג'",
    sortOrder: 40,
  },
  {
    taxonomyKey: "living.seating.benches-ottomans",
    slug: "benches-ottomans",
    kind: "leaf",
    parentSlug: "living-seating",
    nameEn: "Benches & Ottomans",
    nameHe: "ספסלים והדומים",
    sortOrder: 50,
  },
  {
    taxonomyKey: "living.tables.coffee-tables",
    slug: "coffee-tables",
    kind: "leaf",
    parentSlug: "living-tables",
    nameEn: "Coffee Tables",
    nameHe: "שולחנות קפה",
    sortOrder: 10,
  },
  {
    taxonomyKey: "living.tables.side-tables",
    slug: "side-tables",
    kind: "leaf",
    parentSlug: "living-tables",
    nameEn: "Side Tables",
    nameHe: "שולחנות צד",
    sortOrder: 20,
  },
  {
    taxonomyKey: "living.tables.console-tables",
    slug: "console-tables",
    kind: "leaf",
    parentSlug: "living-tables",
    nameEn: "Console Tables",
    nameHe: "קונסולות",
    sortOrder: 30,
  },
  {
    taxonomyKey: "living.storage-cabinets.consoles",
    slug: "consoles",
    kind: "leaf",
    parentSlug: "living-storage-cabinets",
    nameEn: "Consoles",
    nameHe: "קונסולות אחסון",
    sortOrder: 10,
  },
  {
    taxonomyKey: "living.storage-cabinets.shelving",
    slug: "shelving",
    kind: "leaf",
    parentSlug: "living-storage-cabinets",
    nameEn: "Shelving",
    nameHe: "מדפים",
    sortOrder: 20,
  },
  {
    taxonomyKey: "living.storage-cabinets.sideboards",
    slug: "sideboards",
    kind: "leaf",
    parentSlug: "living-storage-cabinets",
    nameEn: "Sideboards",
    nameHe: "מזנונים",
    sortOrder: 30,
  },
  {
    taxonomyKey: "living.storage-cabinets.tv-units",
    slug: "tv-units",
    kind: "leaf",
    parentSlug: "living-storage-cabinets",
    nameEn: "TV Units",
    nameHe: "מעמדי טלוויזיה",
    sortOrder: 40,
  },
  {
    taxonomyKey: "living.storage-cabinets.storage",
    slug: "storage",
    kind: "leaf",
    parentSlug: "living-storage-cabinets",
    nameEn: "Storage",
    nameHe: "אחסון",
    sortOrder: 50,
  },
];

export const CATALOG_TAXONOMY_DEFINITION: CatalogTaxonomyNodeDefinition[] = [
  ...DEPARTMENTS,
  ...LIVING_GROUPS,
  ...LIVING_LEAVES,
];

export function getCatalogTaxonomyDefinition(): CatalogTaxonomyNodeDefinition[] {
  return CATALOG_TAXONOMY_DEFINITION;
}
