import type { PublicImageView } from "@/types/product-media";
import type { CatalogSort } from "@/lib/catalog/catalog-params";

export type CatalogProductView = {
  slug: string;
  nameHe: string;
  nameEn?: string;
  category: string;
  brand?: string;
  primaryImage: PublicImageView | null;
};

export type PublicCategoryView = {
  slug: string;
  nameHe: string;
};

export type CatalogQueryInput = {
  query?: string | null;
  categorySlug?: string | null;
  brand?: string | null;
  material?: string | null;
  sort?: CatalogSort;
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
    brand: string | null;
    material: string | null;
    sort: CatalogSort;
  };
};

export const CATALOG_PAGE_SIZE = 12;
