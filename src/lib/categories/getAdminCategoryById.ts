import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import type { AdminCategoryFormInput } from "@/types/admin-category";

export async function getAdminCategoryById(
  id: string,
): Promise<AdminCategoryFormInput | null> {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectDB();

  const category = await Category.findById(id).lean();

  if (!category) {
    return null;
  }

  return {
    nameHe: category.nameHe,
    nameEn: category.nameEn ?? "",
    slug: category.slug,
    sortOrder: category.sortOrder.toString(),
    isActive: category.isActive,
  };
}
