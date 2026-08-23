import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import Product from "@/models/Product";
import {
  CATALOG_PAGE_SIZE,
  type CatalogQueryInput,
  type CatalogQueryResult,
} from "@/types/catalog";
import { buildProductCatalogFilter } from "@/lib/catalog/build-product-catalog-filter";
import { calculatePagination } from "@/lib/catalog/catalog-pagination";
import { resolveActiveCategorySlug } from "@/lib/catalog/resolve-active-category-slug";
import { searchPublicCatalogProducts } from "@/lib/catalog/search-public-catalog-products";
import { CATALOG_PRIMARY_IMAGE_SELECT } from "@/lib/media/product-media-select";
import { mapProductToCatalogView } from "./mapProductToCatalogView";

export async function getPublicProducts(
  input: CatalogQueryInput = {},
): Promise<CatalogQueryResult> {
  await connectDB();

  const query = input.query?.trim() || null;
  const requestedCategorySlug = input.categorySlug?.trim() || null;
  const pageSize = input.pageSize ?? CATALOG_PAGE_SIZE;
  const requestedPage = input.page ?? 1;

  const categoryId = await resolveActiveCategorySlug(requestedCategorySlug);
  const appliedCategorySlug = categoryId ? requestedCategorySlug : null;

  if (query) {
    return searchPublicCatalogProducts({
      query,
      categoryId,
      page: requestedPage,
      pageSize,
      categorySlug: appliedCategorySlug,
    });
  }

  const filter = buildProductCatalogFilter({
    query,
    categoryId,
  });

  const total = await Product.countDocuments(filter);
  const pagination = calculatePagination({
    total,
    page: requestedPage,
    pageSize,
  });

  const products = await Product.find(filter)
    .populate<{ categoryId: { nameHe: string } | null }>({
      path: "categoryId",
      model: Category,
      select: "nameHe",
    })
    .select(`nameHe nameEn slug brand categoryId ${CATALOG_PRIMARY_IMAGE_SELECT}`)
    .sort({ nameHe: 1 })
    .skip(pagination.skip)
    .limit(pagination.pageSize)
    .lean();

  return {
    products: products.map(mapProductToCatalogView),
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: pagination.totalPages,
    appliedFilters: {
      query,
      categorySlug: appliedCategorySlug,
    },
  };
}
