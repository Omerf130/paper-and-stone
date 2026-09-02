import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import {
  createCategory,
  CategoryMutationError,
} from "@/lib/categories/category-mutations";
import { CATEGORY_ERRORS } from "@/lib/categories/category-validation";

export const INLINE_CATEGORY_ERRORS = {
  DUPLICATE_NAME: "כבר קיימת קטגוריה עם שם זה",
  INVALID_PARENT: "יש לבחור מחלקה או קבוצה תקינה",
  GENERIC: CATEGORY_ERRORS.GENERIC,
} as const;

function slugifyCategoryName(nameHe: string): string {
  return nameHe
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0590-\u05FF-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function findUniqueSlug(baseName: string): Promise<string> {
  await connectDB();

  const baseSlug = slugifyCategoryName(baseName) || "category";
  let candidate = baseSlug;
  let suffix = 2;

  while (await Category.findOne({ slug: candidate }).select("_id").lean()) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function createCategoryInline(input: {
  nameHe: string;
  parentId: string;
}): Promise<
  | { ok: true; categoryId: string; nameHe: string }
  | { ok: false; message: string }
> {
  const trimmedName = input.nameHe.trim();
  if (!trimmedName) {
    return { ok: false, message: "נא להזין שם קטגוריה" };
  }

  if (!Types.ObjectId.isValid(input.parentId)) {
    return { ok: false, message: INLINE_CATEGORY_ERRORS.INVALID_PARENT };
  }

  await connectDB();

  const parent = await Category.findById(input.parentId)
    .select("_id kind taxonomyKey nameHe")
    .lean();

  if (!parent || !parent.taxonomyKey || (parent.kind !== "department" && parent.kind !== "group")) {
    return { ok: false, message: INLINE_CATEGORY_ERRORS.INVALID_PARENT };
  }

  const existing = await Category.findOne({
    nameHe: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    parentId: parent._id,
  })
    .select("_id nameHe")
    .lean();

  if (existing) {
    return { ok: false, message: INLINE_CATEGORY_ERRORS.DUPLICATE_NAME };
  }

  const slug = await findUniqueSlug(trimmedName);

  try {
    const categoryId = await createCategory({
      nameHe: trimmedName,
      slug,
      kind: "leaf",
      parentId: parent._id.toString(),
      sortOrder: 0,
      isActive: true,
    });

    return { ok: true, categoryId, nameHe: trimmedName };
  } catch (error: unknown) {
    if (error instanceof CategoryMutationError) {
      return { ok: false, message: error.message };
    }

    return { ok: false, message: INLINE_CATEGORY_ERRORS.GENERIC };
  }
}
