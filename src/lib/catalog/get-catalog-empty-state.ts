export type CatalogEmptyStateVariant = "global" | "search" | "category" | "filtered";

export type CatalogEmptyStateContent = {
  variant: CatalogEmptyStateVariant;
  message: string;
  resetHref: string | null;
  resetLabel: string | null;
};

type CatalogEmptyStateInput = {
  query: string | null;
  categoryName: string | null;
  hasFilters: boolean;
};

export function getCatalogEmptyState(
  input: CatalogEmptyStateInput,
): CatalogEmptyStateContent {
  const { query, categoryName, hasFilters } = input;

  if (!hasFilters) {
    return {
      variant: "global",
      message: "עדיין לא נוספו מוצרים לקטלוג.",
      resetHref: null,
      resetLabel: null,
    };
  }

  if (query && categoryName) {
    return {
      variant: "filtered",
      message: `לא נמצאו מוצרים בקטגוריה ${categoryName} עבור «${query}».`,
      resetHref: "/products",
      resetLabel: "הצג את כל המוצרים",
    };
  }

  if (query) {
    return {
      variant: "search",
      message: `לא נמצאו מוצרים עבור «${query}».`,
      resetHref: "/products",
      resetLabel: "הצג את כל המוצרים",
    };
  }

  if (categoryName) {
    return {
      variant: "category",
      message: `לא נמצאו מוצרים בקטגוריה ${categoryName}.`,
      resetHref: "/products",
      resetLabel: "הצג את כל המוצרים",
    };
  }

  return {
    variant: "filtered",
    message: "לא נמצאו מוצרים שמתאימים לחיפוש.",
    resetHref: "/products",
    resetLabel: "הצג את כל המוצרים",
  };
}
