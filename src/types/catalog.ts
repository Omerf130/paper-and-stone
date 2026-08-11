export type CatalogProductView = {
  slug: string;
  nameHe: string;
  nameEn?: string;
  category: string;
  brand?: string;
};

export type PublicCategoryView = {
  slug: string;
  nameHe: string;
};

export type CatalogQueryInput = {
  query?: string | null;
  categorySlug?: string | null;
  page?: number;
  pageSize?: number;
};

export type CatalogQueryResult = {
  products: CatalogProductView[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  appliedFilters: {
    query: string | null;
    categorySlug: string | null;
  };
};

export const CATALOG_PAGE_SIZE = 12;
