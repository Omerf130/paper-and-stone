export type ProductVisibilityFilter = "visible" | "hidden";

export type ProductFeaturedFilter = "featured" | "not-featured";

export type AdminProductsParams = {
  query: string | null;
  categoryId: string | null;
  supplierId: string | null;
  visibility: ProductVisibilityFilter | null;
  featured: ProductFeaturedFilter | null;
};

const VISIBILITY_VALUES: ProductVisibilityFilter[] = ["visible", "hidden"];
const FEATURED_VALUES: ProductFeaturedFilter[] = ["featured", "not-featured"];

function parseStringParam(
  raw: string | string[] | undefined,
): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function parseObjectIdParam(
  raw: string | string[] | undefined,
): string | null {
  const value = parseStringParam(raw);

  if (!value || !/^[a-f0-9]{24}$/i.test(value)) {
    return null;
  }

  return value;
}

function parseVisibilityParam(
  raw: string | string[] | undefined,
): ProductVisibilityFilter | null {
  const value = parseStringParam(raw);

  if (!value || !VISIBILITY_VALUES.includes(value as ProductVisibilityFilter)) {
    return null;
  }

  return value as ProductVisibilityFilter;
}

function parseFeaturedParam(
  raw: string | string[] | undefined,
): ProductFeaturedFilter | null {
  const value = parseStringParam(raw);

  if (!value || !FEATURED_VALUES.includes(value as ProductFeaturedFilter)) {
    return null;
  }

  return value as ProductFeaturedFilter;
}

export function parseAdminProductsParams(
  raw: Record<string, string | string[] | undefined>,
): AdminProductsParams {
  return {
    query: parseStringParam(raw.q),
    categoryId: parseObjectIdParam(raw.category),
    supplierId: parseObjectIdParam(raw.supplier),
    visibility: parseVisibilityParam(raw.visibility),
    featured: parseFeaturedParam(raw.featured),
  };
}

export function hasAdminProductsFilters(params: AdminProductsParams): boolean {
  return Boolean(
    params.query ||
      params.categoryId ||
      params.supplierId ||
      params.visibility ||
      params.featured,
  );
}

export function buildAdminProductsHref(
  input: Partial<AdminProductsParams> = {},
): string {
  const params = new URLSearchParams();

  const query = input.query?.trim();
  if (query) {
    params.set("q", query);
  }

  if (input.categoryId) {
    params.set("category", input.categoryId);
  }

  if (input.supplierId) {
    params.set("supplier", input.supplierId);
  }

  if (input.visibility) {
    params.set("visibility", input.visibility);
  }

  if (input.featured) {
    params.set("featured", input.featured);
  }

  const search = params.toString();
  return search ? `/admin/products?${search}` : "/admin/products";
}
