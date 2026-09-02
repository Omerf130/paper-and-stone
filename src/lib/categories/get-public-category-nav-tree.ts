import type { PublicCmsImageView } from "@/types/public-homepage-content";
import type {
  PublicCategoryNavDepartmentView,
  PublicCategoryNavGroupView,
  PublicCategoryNavLeafView,
  PublicCategoryNavTreeView,
} from "@/types/public-category-nav";
import {
  buildCategoryCatalogHref,
  buildCategoryTreeIndexes,
  getLeafPublicProductCount,
  getPublicProductCountsByCategoryId,
  isCategoryNavigable,
  type CategoryRecord,
} from "@/lib/categories/category-nav-availability";
import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";

function resolveSlugFromTileHref(href: string | undefined): string | null {
  if (!href) {
    return null;
  }

  try {
    const url = new URL(href, "http://localhost");
    return url.searchParams.get("category");
  } catch {
    return null;
  }
}

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

function buildLeafView(
  leaf: CategoryRecord,
  counts: Map<string, number>,
  childrenByParentId: Map<string, CategoryRecord[]>,
  byId: Map<string, CategoryRecord>,
): PublicCategoryNavLeafView {
  const productCount = getLeafPublicProductCount(leaf.id, counts);
  const isNavigable = isCategoryNavigable(leaf, counts, childrenByParentId, byId);

  return {
    slug: leaf.slug,
    nameHe: leaf.nameHe,
    nameEn: leaf.nameEn,
    productCount,
    isNavigable,
    href: buildCategoryCatalogHref(leaf.slug, isNavigable),
  };
}

function buildGroupView(
  group: CategoryRecord,
  counts: Map<string, number>,
  childrenByParentId: Map<string, CategoryRecord[]>,
  byId: Map<string, CategoryRecord>,
): PublicCategoryNavGroupView {
  const children = (childrenByParentId.get(group.id) ?? []).filter(
    (child) => child.kind === "leaf",
  );

  return {
    slug: group.slug,
    nameHe: group.nameHe,
    nameEn: group.nameEn,
    isNavigable: isCategoryNavigable(group, counts, childrenByParentId, byId),
    leaves: children.map((leaf) =>
      buildLeafView(leaf, counts, childrenByParentId, byId),
    ),
  };
}

function buildDepartmentView(
  department: CategoryRecord,
  counts: Map<string, number>,
  childrenByParentId: Map<string, CategoryRecord[]>,
  byId: Map<string, CategoryRecord>,
  imageBySlug: Map<string, PublicCmsImageView>,
): PublicCategoryNavDepartmentView {
  const isNavigable = isCategoryNavigable(
    department,
    counts,
    childrenByParentId,
    byId,
  );

  const groups = (childrenByParentId.get(department.id) ?? [])
    .filter((child) => child.kind === "group")
    .map((group) => buildGroupView(group, counts, childrenByParentId, byId));

  const directLeaves = (childrenByParentId.get(department.id) ?? [])
    .filter((child) => child.kind === "leaf")
    .map((leaf) => buildLeafView(leaf, counts, childrenByParentId, byId));

  return {
    slug: department.slug,
    nameHe: department.nameHe,
    nameEn: department.nameEn,
    isNavigable,
    href: buildCategoryCatalogHref(department.slug, isNavigable),
    descriptionHe: department.descriptionHe,
    descriptionEn: department.descriptionEn,
    image: imageBySlug.get(department.slug),
    groups,
    directLeaves,
  };
}

export async function getPublicCategoryNavTree(input?: {
  homepageCategoryTileHrefs?: Array<{ href?: string; image?: PublicCmsImageView }>;
}): Promise<PublicCategoryNavTreeView> {
  await connectDB();

  const [categories, counts] = await Promise.all([
    Category.find({ taxonomyKey: { $exists: true, $ne: null } })
      .sort({ sortOrder: 1, nameHe: 1 })
      .lean(),
    getPublicProductCountsByCategoryId(),
  ]);

  const records = categories.map(mapCategoryRecord);
  const { byId, childrenByParentId } = buildCategoryTreeIndexes(records);

  const imageBySlug = new Map<string, PublicCmsImageView>();

  for (const tile of input?.homepageCategoryTileHrefs ?? []) {
    const slug = resolveSlugFromTileHref(tile.href);

    if (slug && tile.image && !imageBySlug.has(slug)) {
      imageBySlug.set(slug, tile.image);
    }
  }

  const departments = records
    .filter((category) => category.kind === "department")
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((department) =>
      buildDepartmentView(
        department,
        counts,
        childrenByParentId,
        byId,
        imageBySlug,
      ),
    );

  return { departments };
}

export async function getPublicCatalogCategoryLeaves(): Promise<
  PublicCategoryNavLeafView[]
> {
  const tree = await getPublicCategoryNavTree();

  return tree.departments.flatMap((department) => [
    ...department.directLeaves,
    ...department.groups.flatMap((group) => group.leaves),
  ]);
}
