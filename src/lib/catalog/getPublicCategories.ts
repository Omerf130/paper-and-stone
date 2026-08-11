import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import type { PublicCategoryView } from "@/types/catalog";

export async function getPublicCategories(): Promise<PublicCategoryView[]> {
  await connectDB();

  const categories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, nameHe: 1 })
    .select("slug nameHe")
    .lean();

  return categories.map((category) => ({
    slug: category.slug,
    nameHe: category.nameHe,
  }));
}
