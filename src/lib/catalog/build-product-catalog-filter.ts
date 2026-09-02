import type { Types } from "mongoose";
import { escapeRegex } from "./escape-regex";

export type ProductCatalogFilterInput = {
  query?: string | null;
  categoryIds?: Types.ObjectId[];
  brand?: string | null;
  material?: string | null;
};

type ProductCatalogFilter = {
  isActive: true;
  categoryId?: Types.ObjectId | { $in: Types.ObjectId[] };
  brand?: string;
  materials?: string;
  $or?: Array<{
    nameHe?: RegExp;
    nameEn?: RegExp;
    brand?: RegExp;
    designer?: RegExp;
    sku?: RegExp;
  }>;
};

export function buildProductCatalogFilter({
  query,
  categoryIds,
  brand,
  material,
}: ProductCatalogFilterInput): ProductCatalogFilter {
  const filter: ProductCatalogFilter = { isActive: true };

  if (categoryIds && categoryIds.length === 1) {
    filter.categoryId = categoryIds[0];
  } else if (categoryIds && categoryIds.length > 1) {
    filter.categoryId = { $in: categoryIds };
  }

  const trimmedBrand = brand?.trim();
  if (trimmedBrand) {
    filter.brand = trimmedBrand;
  }

  const trimmedMaterial = material?.trim();
  if (trimmedMaterial) {
    filter.materials = trimmedMaterial;
  }

  const trimmedQuery = query?.trim();

  if (trimmedQuery) {
    const pattern = new RegExp(escapeRegex(trimmedQuery), "i");

    filter.$or = [
      { nameHe: pattern },
      { nameEn: pattern },
      { brand: pattern },
      { designer: pattern },
      { sku: pattern },
    ];
  }

  return filter;
}

export function resolveCatalogSort(sort: "name-asc" | "name-desc" = "name-asc"): {
  nameHe: 1 | -1;
} {
  return { nameHe: sort === "name-desc" ? -1 : 1 };
}
