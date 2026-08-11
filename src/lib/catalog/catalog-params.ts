export type CatalogParams = {
  query: string | null;
  categorySlug: string | null;
  page: number;
};

export type CatalogHrefInput = {
  query?: string | null;
  categorySlug?: string | null;
  page?: number;
};

function parsePageValue(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (!value) {
    return 1;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function parseStringParam(
  raw: string | string[] | undefined,
): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

export function parseCatalogParams(
  raw: Record<string, string | string[] | undefined>,
): CatalogParams {
  return {
    query: parseStringParam(raw.q),
    categorySlug: parseStringParam(raw.category),
    page: parsePageValue(raw.page),
  };
}

export function buildCatalogHref(input: CatalogHrefInput = {}): string {
  const params = new URLSearchParams();

  const query = input.query?.trim();
  if (query) {
    params.set("q", query);
  }

  const categorySlug = input.categorySlug?.trim();
  if (categorySlug) {
    params.set("category", categorySlug);
  }

  if (input.page && input.page > 1) {
    params.set("page", String(input.page));
  }

  const search = params.toString();

  return search ? `/products?${search}` : "/products";
}

export function hasCatalogFilters(params: CatalogParams): boolean {
  return Boolean(params.query || params.categorySlug);
}
