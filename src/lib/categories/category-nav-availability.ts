import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import type { CategoryKind } from "@/types/category-kind";

export type CategoryRecord = {
  id: string;
  slug: string;
  nameHe: string;
  nameEn?: string;
  kind: CategoryKind;
  parentId?: string;
  taxonomyKey?: string;
  descriptionHe?: string;
  descriptionEn?: string;
  sortOrder: number;
};

export async function getPublicProductCountsByCategoryId(): Promise<Map<string, number>> {
  await connectDB();

  const results = await Product.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { isActive: true } },
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
  ]);

  return new Map(
    results.map((entry) => [entry._id.toString(), entry.count]),
  );
}

export function buildCategoryTreeIndexes(categories: CategoryRecord[]): {
  byId: Map<string, CategoryRecord>;
  childrenByParentId: Map<string, CategoryRecord[]>;
} {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const childrenByParentId = new Map<string, CategoryRecord[]>();

  for (const category of categories) {
    if (!category.parentId) {
      continue;
    }

    const siblings = childrenByParentId.get(category.parentId) ?? [];
    siblings.push(category);
    childrenByParentId.set(category.parentId, siblings);
  }

  for (const siblings of childrenByParentId.values()) {
    siblings.sort((left, right) => left.sortOrder - right.sortOrder || left.nameHe.localeCompare(right.nameHe, "he"));
  }

  return { byId, childrenByParentId };
}

export function collectDescendantLeaves(
  categoryId: string,
  childrenByParentId: Map<string, CategoryRecord[]>,
  byId: Map<string, CategoryRecord>,
): CategoryRecord[] {
  const category = byId.get(categoryId);

  if (!category) {
    return [];
  }

  if (category.kind === "leaf") {
    return [category];
  }

  const children = childrenByParentId.get(categoryId) ?? [];
  return children.flatMap((child) =>
    collectDescendantLeaves(child.id, childrenByParentId, byId),
  );
}

export function isCategoryNavigable(
  category: CategoryRecord,
  counts: Map<string, number>,
  childrenByParentId: Map<string, CategoryRecord[]>,
  byId: Map<string, CategoryRecord>,
): boolean {
  if (category.kind === "leaf") {
    return (counts.get(category.id) ?? 0) > 0;
  }

  const leaves = collectDescendantLeaves(category.id, childrenByParentId, byId);
  return leaves.some((leaf) => (counts.get(leaf.id) ?? 0) > 0);
}

export function buildCategoryCatalogHref(
  slug: string,
  isNavigable: boolean,
): string | undefined {
  if (!isNavigable) {
    return undefined;
  }

  return `/products?category=${encodeURIComponent(slug)}`;
}

export function buildDepartmentLandingHref(slug: string): string {
  return `/products?category=${encodeURIComponent(slug)}`;
}

export function getLeafPublicProductCount(
  categoryId: string,
  counts: Map<string, number>,
): number {
  return counts.get(categoryId) ?? 0;
}
