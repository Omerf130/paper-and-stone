import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import Product from "@/models/Product";
import type { AdminProductListItem } from "@/types/admin-product";

export async function getAdminProducts(): Promise<AdminProductListItem[]> {
  await connectDB();

  const products = await Product.find({})
    .populate<{ categoryId: { nameHe: string } | null }>({
      path: "categoryId",
      model: Category,
      select: "nameHe",
    })
    .sort({ updatedAt: -1 })
    .lean();

  return products.map((product) => ({
    id: product._id.toString(),
    nameHe: product.nameHe,
    sku: product.sku,
    categoryName: product.categoryId?.nameHe ?? "—",
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    updatedAt: product.updatedAt.toISOString(),
  }));
}
