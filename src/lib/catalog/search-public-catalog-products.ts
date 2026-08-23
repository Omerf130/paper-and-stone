import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { escapeRegex } from "@/lib/catalog/escape-regex";
import { calculatePagination } from "@/lib/catalog/catalog-pagination";
import { normalizeProductSku } from "@/lib/products/normalize-product-sku";
import { mapProductToCatalogView } from "@/lib/products/mapProductToCatalogView";
import type { CatalogQueryResult } from "@/types/catalog";

/**
 * Catalog search ranking tiers (MongoDB aggregation, database-side):
 * 0 = exact normalized SKU or exact SKU (case-insensitive)
 * 1 = SKU prefix match
 * 2 = name/brand/designer match
 *
 * Pagination uses $skip/$limit in the aggregation pipeline — no unbounded
 * in-memory candidate load. Browse without `q` uses normal find()+skip/limit.
 */
export async function searchPublicCatalogProducts(input: {
  query: string;
  categoryId?: Types.ObjectId | null;
  page: number;
  pageSize: number;
  categorySlug?: string | null;
}): Promise<CatalogQueryResult> {
  await connectDB();

  const trimmedQuery = input.query.trim();
  const normalizedQuery = normalizeProductSku(trimmedQuery);
  const escaped = escapeRegex(trimmedQuery);
  const regexPattern = escaped;
  const prefixPattern = `^${escaped}`;

  const matchStage: Record<string, unknown> = {
    isActive: true,
    $or: [
      { skuNormalized: normalizedQuery },
      { sku: { $regex: prefixPattern, $options: "i" } },
      { nameHe: { $regex: regexPattern, $options: "i" } },
      { nameEn: { $regex: regexPattern, $options: "i" } },
      { brand: { $regex: regexPattern, $options: "i" } },
      { designer: { $regex: regexPattern, $options: "i" } },
    ],
  };

  if (input.categoryId) {
    matchStage.categoryId = input.categoryId;
  }

  const total = await Product.countDocuments(matchStage);
  const pagination = calculatePagination({
    total,
    page: input.page,
    pageSize: input.pageSize,
  });

  const pipeline = [
    { $match: matchStage },
    {
      $addFields: {
        searchRank: {
          $cond: {
            if: {
              $or: [
                { $eq: ["$skuNormalized", normalizedQuery] },
                {
                  $eq: [
                    { $toLower: { $trim: { input: "$sku" } } },
                    trimmedQuery.toLowerCase(),
                  ],
                },
              ],
            },
            then: 0,
            else: {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$sku",
                    regex: prefixPattern,
                    options: "i",
                  },
                },
                then: 1,
                else: 2,
              },
            },
          },
        },
      },
    },
    { $sort: { searchRank: 1 as const, nameHe: 1 as const } },
    { $skip: pagination.skip },
    { $limit: pagination.pageSize },
  ];

  const products = await Product.aggregate(pipeline as never);

  const categoryIds = [
    ...new Set(
      products
        .map((product) => product.categoryId?.toString())
        .filter(Boolean) as string[],
    ),
  ];

  const categories =
    categoryIds.length > 0
      ? await Category.find({
          _id: { $in: categoryIds.map((id) => new Types.ObjectId(id)) },
        })
          .select("nameHe")
          .lean()
      : [];

  const categoryNameById = new Map(
    categories.map((category) => [category._id.toString(), category.nameHe]),
  );

  return {
    products: products.map((product) =>
      mapProductToCatalogView({
        ...product,
        categoryId: product.categoryId
          ? { nameHe: categoryNameById.get(product.categoryId.toString()) ?? "" }
          : null,
      }),
    ),
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: pagination.totalPages,
    appliedFilters: {
      query: trimmedQuery,
      categorySlug: input.categorySlug ?? null,
    },
  };
}
