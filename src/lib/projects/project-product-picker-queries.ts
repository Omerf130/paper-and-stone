import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { escapeRegex } from "@/lib/catalog/escape-regex";
import { calculatePagination } from "@/lib/catalog/catalog-pagination";
import { CATALOG_PRIMARY_IMAGE_SELECT } from "@/lib/media/product-media-select";
import { normalizeProductSku } from "@/lib/products/normalize-product-sku";

export const PRODUCT_PICKER_PAGE_SIZE = 16;

export type ProductPickerItemView = {
  id: string;
  slug: string;
  nameHe: string;
  sku: string;
  categoryName?: string;
  primaryImageUrl?: string;
};

export type ProductPickerResult = {
  products: ProductPickerItemView[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function mapPickerProduct(product: {
  _id: { toString(): string };
  slug: string;
  nameHe: string;
  sku: string;
  categoryId?: { nameHe?: string } | null;
  media?: { primaryImage?: { url?: string } };
}): ProductPickerItemView {
  return {
    id: product._id.toString(),
    slug: product.slug,
    nameHe: product.nameHe,
    sku: product.sku,
    categoryName: product.categoryId?.nameHe,
    primaryImageUrl: product.media?.primaryImage?.url,
  };
}

export async function searchProductsForProjectPicker(input: {
  query?: string | null;
  page?: number;
}): Promise<ProductPickerResult> {
  await connectDB();

  const trimmedQuery = input.query?.trim() ?? "";
  const pageSize = PRODUCT_PICKER_PAGE_SIZE;

  if (!trimmedQuery) {
    const total = await Product.countDocuments({ isActive: true });
    const resolvedPagination = calculatePagination({
      total,
      page: input.page ?? 1,
      pageSize,
    });

    const products = await Product.find({ isActive: true })
      .populate<{ categoryId: { nameHe: string } | null }>({
        path: "categoryId",
        model: Category,
        select: "nameHe",
      })
      .select(`nameHe slug sku categoryId ${CATALOG_PRIMARY_IMAGE_SELECT}`)
      .sort({ nameHe: 1 })
      .skip(resolvedPagination.skip)
      .limit(resolvedPagination.pageSize)
      .lean();

    return {
      products: products.map(mapPickerProduct),
      total,
      page: resolvedPagination.page,
      pageSize,
      totalPages: resolvedPagination.totalPages,
    };
  }

  const normalizedQuery = normalizeProductSku(trimmedQuery);
  const regex = new RegExp(escapeRegex(trimmedQuery), "i");
  const prefixRegex = new RegExp(`^${escapeRegex(trimmedQuery)}`, "i");

  const exactMatch = await Product.findOne({
    isActive: true,
    $or: [
      { skuNormalized: normalizedQuery },
      { sku: trimmedQuery },
    ],
  })
    .populate<{ categoryId: { nameHe: string } | null }>({
      path: "categoryId",
      model: Category,
      select: "nameHe",
    })
    .select(`nameHe slug sku skuNormalized categoryId ${CATALOG_PRIMARY_IMAGE_SELECT}`)
    .lean();

  const filter = {
    isActive: true,
    $or: [
      { skuNormalized: normalizedQuery },
      { sku: prefixRegex },
      { nameHe: regex },
    ],
  };

  const allMatches = await Product.find(filter)
    .populate<{ categoryId: { nameHe: string } | null }>({
      path: "categoryId",
      model: Category,
      select: "nameHe",
    })
    .select(`nameHe slug sku skuNormalized categoryId ${CATALOG_PRIMARY_IMAGE_SELECT}`)
    .lean();

  const exactId = exactMatch?._id.toString();
  const ranked = [...allMatches].sort((left, right) => {
    const leftNormalized = left.skuNormalized ?? normalizeProductSku(left.sku);
    const rightNormalized = right.skuNormalized ?? normalizeProductSku(right.sku);

    const leftExact =
      leftNormalized === normalizedQuery || left.sku === trimmedQuery ? 0 : 1;
    const rightExact =
      rightNormalized === normalizedQuery || right.sku === trimmedQuery ? 0 : 1;

    if (leftExact !== rightExact) {
      return leftExact - rightExact;
    }

    const leftPrefix = left.sku.match(prefixRegex) ? 0 : 1;
    const rightPrefix = right.sku.match(prefixRegex) ? 0 : 1;

    if (leftPrefix !== rightPrefix) {
      return leftPrefix - rightPrefix;
    }

    return left.nameHe.localeCompare(right.nameHe, "he");
  });

  const deduped = exactId
    ? [
        exactMatch!,
        ...ranked.filter((product) => product._id.toString() !== exactId),
      ]
    : ranked;

  const total = deduped.length;
  const resolvedPagination = calculatePagination({
    total,
    page: input.page ?? 1,
    pageSize,
  });

  const pageItems = deduped.slice(
    resolvedPagination.skip,
    resolvedPagination.skip + resolvedPagination.pageSize,
  );

  return {
    products: pageItems.map(mapPickerProduct),
    total,
    page: resolvedPagination.page,
    pageSize,
    totalPages: resolvedPagination.totalPages,
  };
}
