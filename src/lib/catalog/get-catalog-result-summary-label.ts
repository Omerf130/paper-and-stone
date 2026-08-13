type CatalogResultSummaryInput = {
  total: number;
  query: string | null;
  categoryName: string | null;
  hasFilters: boolean;
};

export function getCatalogResultSummaryLabel(
  input: CatalogResultSummaryInput,
): string {
  const { total, query, categoryName, hasFilters } = input;

  if (!hasFilters) {
    return `${total} מוצרים`;
  }

  const countLabel = `${total} תוצאות`;
  const parts: string[] = [countLabel];

  if (categoryName) {
    parts.push(categoryName);
  }

  if (query) {
    parts.push(`«${query}»`);
  }

  return parts.join(" · ");
}
