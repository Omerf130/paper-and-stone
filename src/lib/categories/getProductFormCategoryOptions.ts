import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import type { CategoryOption } from "@/types/admin-product";

export async function getProductFormCategoryOptions(
  currentCategoryId?: string,
): Promise<CategoryOption[]> {
  await connectDB();

  const activeCategories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, nameHe: 1 })
    .select("_id nameHe isActive")
    .lean();

  const options: CategoryOption[] = activeCategories.map((category) => ({
    id: category._id.toString(),
    nameHe: category.nameHe,
    isActive: true,
  }));

  if (!currentCategoryId) {
    return options;
  }

  const alreadyIncluded = options.some(
    (option) => option.id === currentCategoryId,
  );

  if (alreadyIncluded) {
    return options;
  }

  const currentCategory = await Category.findById(currentCategoryId)
    .select("_id nameHe isActive")
    .lean();

  if (!currentCategory) {
    return options;
  }

  return [
    ...options,
    {
      id: currentCategory._id.toString(),
      nameHe: currentCategory.nameHe,
      isActive: currentCategory.isActive,
    },
  ];
}
