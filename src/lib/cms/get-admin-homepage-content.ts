import { connectDB } from "@/lib/db/mongoose";
import { getHomepageContent } from "@/lib/cms/get-cms-content";
import {
  getHomepageCategoryRecords,
  type HomepageCategoryRecord,
} from "@/lib/cms/get-homepage-category-records";
import { homepageDocumentExists } from "@/lib/cms/homepage-content-mutations";
import Category from "@/models/Category";
import type {
  AdminHomepageCategoryOption,
  AdminHomepageCategoryTileState,
  AdminHomepageContentPayload,
} from "@/types/admin-homepage-content";
import type { HomepageContentView } from "@/types/cms-content";

export async function getHomepageCategoryOptions(
  referencedCategoryIds: string[],
): Promise<AdminHomepageCategoryOption[]> {
  await connectDB();

  const activeCategories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, nameHe: 1 })
    .select("_id nameHe slug isActive")
    .lean();

  const options = new Map<string, AdminHomepageCategoryOption>();

  for (const category of activeCategories) {
    const id = category._id.toString();
    options.set(id, {
      id,
      nameHe: category.nameHe,
      slug: category.slug,
      isActive: true,
    });
  }

  const missingIds = referencedCategoryIds.filter((id) => !options.has(id));

  if (missingIds.length > 0) {
    const referencedCategories = await Category.find({ _id: { $in: missingIds } })
      .select("_id nameHe slug isActive")
      .lean();

    for (const category of referencedCategories) {
      const id = category._id.toString();
      options.set(id, {
        id,
        nameHe: category.nameHe,
        slug: category.slug,
        isActive: category.isActive,
      });
    }
  }

  return [...options.values()].sort((left, right) =>
    left.nameHe.localeCompare(right.nameHe, "he"),
  );
}

function buildCategoryTileStates(
  content: HomepageContentView,
  categoryRecords: Map<string, HomepageCategoryRecord>,
): Record<string, AdminHomepageCategoryTileState> {
  const states: Record<string, AdminHomepageCategoryTileState> = {};

  for (const item of content.categories.items) {
    if (!item.categoryId) {
      states[item.id] = { status: "unassigned" };
      continue;
    }

    const record = categoryRecords.get(item.categoryId);

    if (!record) {
      states[item.id] = {
        status: "missing",
        categoryId: item.categoryId,
      };
      continue;
    }

    if (!record.isActive) {
      states[item.id] = {
        status: "inactive",
        categoryId: item.categoryId,
        nameHe: record.nameHe,
        slug: record.slug,
      };
      continue;
    }

    states[item.id] = {
      status: "active",
      categoryId: item.categoryId,
      nameHe: record.nameHe,
      slug: record.slug,
    };
  }

  return states;
}

export async function getAdminHomepageContent(): Promise<AdminHomepageContentPayload> {
  const [content, documentExists] = await Promise.all([
    getHomepageContent(),
    homepageDocumentExists(),
  ]);

  const referencedCategoryIds = content.categories.items
    .map((item) => item.categoryId)
    .filter((id): id is string => Boolean(id));

  const [categoryOptions, categoryRecords] = await Promise.all([
    getHomepageCategoryOptions(referencedCategoryIds),
    getHomepageCategoryRecords(referencedCategoryIds),
  ]);

  return {
    content,
    documentExists,
    categoryOptions,
    categoryTileStates: buildCategoryTileStates(content, categoryRecords),
  };
}
