import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import type { CategoryOption } from "@/types/admin-product";

export async function getActiveCategories(): Promise<CategoryOption[]> {
  await connectDB();

  const categories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, nameHe: 1 })
    .select("_id nameHe")
    .lean();

  return categories.map((category) => ({
    id: category._id.toString(),
    nameHe: category.nameHe,
  }));
}

export async function verifyActiveCategory(
  categoryId: string,
): Promise<boolean> {
  await connectDB();

  const category = await Category.findOne({ _id: categoryId, isActive: true })
    .select("_id")
    .lean();

  return category !== null;
}
