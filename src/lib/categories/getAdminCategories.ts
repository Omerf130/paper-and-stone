import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import Product from "@/models/Product";
import type { AdminCategoryListItem } from "@/types/admin-category";

type ProductCountResult = {
  _id: string;
  count: number;
};

export async function getAdminCategories(): Promise<AdminCategoryListItem[]> {
  await connectDB();

  const [categories, productCounts] = await Promise.all([
    Category.find({})
      .sort({ sortOrder: 1, nameHe: 1 })
      .lean(),
    Product.aggregate<ProductCountResult>([
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    ]),
  ]);

  const countByCategoryId = new Map<string, number>(
    productCounts.map((item) => [item._id.toString(), item.count]),
  );

  return categories.map((category) => ({
    id: category._id.toString(),
    nameHe: category.nameHe,
    nameEn: category.nameEn,
    slug: category.slug,
    isActive: category.isActive,
    sortOrder: category.sortOrder,
    productCount: countByCategoryId.get(category._id.toString()) ?? 0,
    updatedAt: category.updatedAt.toISOString(),
  }));
}
