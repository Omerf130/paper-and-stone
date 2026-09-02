import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import { isProductAssignableCategoryKind } from "@/types/category-kind";

export async function verifyActiveCategory(categoryId: string): Promise<boolean> {
  await connectDB();

  const category = await Category.findOne({ _id: categoryId, isActive: true })
    .select("_id kind taxonomyKey parentId")
    .lean();

  if (!category) {
    return false;
  }

  return (
    isProductAssignableCategoryKind(category.kind) &&
    Boolean(category.taxonomyKey && category.parentId)
  );
}
