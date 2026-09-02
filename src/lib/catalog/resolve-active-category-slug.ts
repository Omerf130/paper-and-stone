import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import {
  buildCategoryTreeIndexes,
  collectDescendantLeaves,
  type CategoryRecord,
} from "@/lib/categories/category-nav-availability";

export type CategoryCatalogFilter = {
  categoryIds: Types.ObjectId[];
  appliedCategorySlug: string | null;
};

function mapCategoryRecord(category: {
  _id: { toString(): string };
  slug: string;
  nameHe: string;
  nameEn?: string;
  kind: CategoryRecord["kind"];
  parentId?: { toString(): string };
  taxonomyKey?: string;
  descriptionHe?: string;
  descriptionEn?: string;
  sortOrder: number;
}): CategoryRecord {
  return {
    id: category._id.toString(),
    slug: category.slug,
    nameHe: category.nameHe,
    nameEn: category.nameEn,
    kind: category.kind,
    parentId: category.parentId?.toString(),
    taxonomyKey: category.taxonomyKey,
    descriptionHe: category.descriptionHe,
    descriptionEn: category.descriptionEn,
    sortOrder: category.sortOrder,
  };
}

export async function resolveCategoryCatalogFilter(
  categorySlug: string | null | undefined,
): Promise<CategoryCatalogFilter> {
  const slug = categorySlug?.trim();

  if (!slug) {
    return { categoryIds: [], appliedCategorySlug: null };
  }

  await connectDB();

  const category = await Category.findOne({ slug, isActive: true }).lean();

  if (!category) {
    return { categoryIds: [], appliedCategorySlug: null };
  }

  const categories = await Category.find({ isActive: true }).lean();
  const records = categories.map(mapCategoryRecord);
  const { byId, childrenByParentId } = buildCategoryTreeIndexes(records);
  const record = byId.get(category._id.toString());

  if (!record) {
    return { categoryIds: [], appliedCategorySlug: null };
  }

  const targetLeaves =
    record.kind === "leaf"
      ? [record]
      : collectDescendantLeaves(record.id, childrenByParentId, byId);

  return {
    categoryIds: targetLeaves.map((leaf) => new Types.ObjectId(leaf.id)),
    appliedCategorySlug: slug,
  };
}

/** @deprecated Prefer resolveCategoryCatalogFilter */
export async function resolveActiveCategorySlug(
  categorySlug: string | null | undefined,
): Promise<Types.ObjectId | null> {
  const filter = await resolveCategoryCatalogFilter(categorySlug);

  if (filter.categoryIds.length === 1) {
    return filter.categoryIds[0] ?? null;
  }

  return null;
}
