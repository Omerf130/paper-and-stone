import type { Types } from "mongoose";
import { escapeRegex } from "./escape-regex";

export type ProductCatalogFilterInput = {
  query?: string | null;
  categoryId?: Types.ObjectId | null;
};

type ProductCatalogFilter = {
  isActive: true;
  categoryId?: Types.ObjectId;
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
  categoryId,
}: ProductCatalogFilterInput): ProductCatalogFilter {
  const filter: ProductCatalogFilter = { isActive: true };

  if (categoryId) {
    filter.categoryId = categoryId;
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
