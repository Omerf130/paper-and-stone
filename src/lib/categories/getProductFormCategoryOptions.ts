import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import type {
  ProductFormCategoryLeafOption,
  ProductFormCategoryParentOption,
  ProductFormCategoryTreeView,
} from "@/types/public-category-nav";

export async function getProductFormCategoryTree(
  currentCategoryId?: string,
): Promise<ProductFormCategoryTreeView> {
  await connectDB();

  const categories = await Category.find({
    taxonomyKey: { $exists: true, $ne: null },
    isActive: true,
  })
    .sort({ sortOrder: 1, nameHe: 1 })
    .select("_id slug nameHe nameEn kind parentId")
    .lean();

  const byId = new Map(
    categories.map((category) => [category._id.toString(), category]),
  );

  const parentOptions: ProductFormCategoryParentOption[] = [];
  const leaves: ProductFormCategoryLeafOption[] = [];

  for (const category of categories) {
    if (category.kind === "department") {
      parentOptions.push({
        id: category._id.toString(),
        nameHe: category.nameHe,
        nameEn: category.nameEn,
        kind: "department",
        departmentNameHe: category.nameHe,
      });
    }

    if (category.kind === "group") {
      const department = category.parentId
        ? byId.get(category.parentId.toString())
        : undefined;

      parentOptions.push({
        id: category._id.toString(),
        nameHe: category.nameHe,
        nameEn: category.nameEn,
        kind: "group",
        departmentNameHe: department?.nameHe ?? category.nameHe,
      });
    }

    if (category.kind === "leaf" && category.parentId) {
      const parent = byId.get(category.parentId.toString());
      const department =
        parent?.kind === "group" && parent.parentId
          ? byId.get(parent.parentId.toString())
          : parent;

      const breadcrumb = [department?.nameHe, parent?.nameHe, category.nameHe]
        .filter(Boolean)
        .join(" › ");

      leaves.push({
        id: category._id.toString(),
        slug: category.slug,
        nameHe: category.nameHe,
        nameEn: category.nameEn,
        isActive: true,
        parentId: category.parentId.toString(),
        breadcrumb,
      });
    }
  }

  if (currentCategoryId && !leaves.some((leaf) => leaf.id === currentCategoryId)) {
    const currentCategory = await Category.findById(currentCategoryId)
      .select("_id slug nameHe nameEn kind parentId isActive")
      .lean();

    if (currentCategory?.kind === "leaf") {
      leaves.push({
        id: currentCategory._id.toString(),
        slug: currentCategory.slug,
        nameHe: currentCategory.nameHe,
        nameEn: currentCategory.nameEn,
        isActive: currentCategory.isActive,
        parentId: currentCategory.parentId?.toString() ?? "",
        breadcrumb: currentCategory.nameHe,
      });
    }
  }

  parentOptions.sort(
    (left, right) =>
      left.departmentNameHe.localeCompare(right.departmentNameHe, "he") ||
      left.nameHe.localeCompare(right.nameHe, "he"),
  );

  leaves.sort((left, right) => left.breadcrumb.localeCompare(right.breadcrumb, "he"));

  return { parentOptions, leaves };
}

/** @deprecated Use getProductFormCategoryTree */
export async function getProductFormCategoryOptions(currentCategoryId?: string) {
  const tree = await getProductFormCategoryTree(currentCategoryId);

  return tree.leaves.map((leaf) => ({
    id: leaf.id,
    nameHe: leaf.breadcrumb,
    isActive: leaf.isActive,
  }));
}
