import { Types } from "mongoose";
import { escapeRegex } from "@/lib/catalog/escape-regex";
import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Supplier from "@/models/Supplier";
import type { AdminProductListItem } from "@/types/admin-product";
import type { AdminProductsParams } from "@/lib/products/product-params";

type AdminProductsFilter = {
  $and?: Array<Record<string, unknown>>;
  $or?: Array<Record<string, unknown>>;
  categoryId?: Types.ObjectId;
  supplierId?: Types.ObjectId;
  isActive?: boolean;
  isFeatured?: boolean;
};

export function buildAdminProductsFilter(
  params: AdminProductsParams,
): AdminProductsFilter {
  const conditions: Array<Record<string, unknown>> = [];

  if (params.query) {
    const regex = escapeRegex(params.query);
    conditions.push({
      $or: [
        { nameHe: { $regex: regex, $options: "i" } },
        { nameEn: { $regex: regex, $options: "i" } },
        { sku: { $regex: regex, $options: "i" } },
        { slug: { $regex: regex, $options: "i" } },
        { internalCatalogName: { $regex: regex, $options: "i" } },
        { catalogCode: { $regex: regex, $options: "i" } },
      ],
    });
  }

  if (params.categoryId) {
    conditions.push({ categoryId: new Types.ObjectId(params.categoryId) });
  }

  if (params.supplierId) {
    conditions.push({ supplierId: new Types.ObjectId(params.supplierId) });
  }

  if (params.visibility === "visible") {
    conditions.push({ isActive: true });
  } else if (params.visibility === "hidden") {
    conditions.push({ isActive: false });
  }

  if (params.featured === "featured") {
    conditions.push({ isFeatured: true });
  } else if (params.featured === "not-featured") {
    conditions.push({ isFeatured: false });
  }

  if (conditions.length === 0) {
    return {};
  }

  if (conditions.length === 1) {
    return conditions[0] as AdminProductsFilter;
  }

  return { $and: conditions };
}

export type AdminProductsPageResult = {
  products: AdminProductListItem[];
  total: number;
};

export async function getAdminProducts(
  params: AdminProductsParams,
): Promise<AdminProductsPageResult> {
  await connectDB();

  const filter = buildAdminProductsFilter(params);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate<{ categoryId: { nameHe: string } | null }>({
        path: "categoryId",
        model: Category,
        select: "nameHe",
      })
      .populate<{ supplierId: { name: string } | null }>({
        path: "supplierId",
        model: Supplier,
        select: "name",
      })
      .sort({ updatedAt: -1 })
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products: products.map((product) => ({
      id: product._id.toString(),
      nameHe: product.nameHe,
      sku: product.sku,
      categoryName: product.categoryId?.nameHe ?? "—",
      supplierName: product.supplierId?.name,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      updatedAt: product.updatedAt.toISOString(),
    })),
    total,
  };
}
