import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { isDuplicateKeyError } from "@/lib/products/product-validation";
import Category from "@/models/Category";
import {
  CATEGORY_ERRORS,
  type CategoryWriteFields,
} from "./category-validation";

export class CategoryMutationError extends Error {
  fieldErrors?: Record<string, string>;

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

export async function createCategory(
  fields: CategoryWriteFields,
): Promise<string> {
  await connectDB();

  try {
    const category = await Category.create({
      nameHe: fields.nameHe,
      nameEn: fields.nameEn,
      slug: fields.slug,
      kind: fields.kind ?? "leaf",
      parentId: fields.parentId ? new Types.ObjectId(fields.parentId) : undefined,
      taxonomyKey: fields.taxonomyKey,
      descriptionHe: fields.descriptionHe,
      descriptionEn: fields.descriptionEn,
      sortOrder: fields.sortOrder,
      isActive: fields.isActive,
    });

    return category._id.toString();
  } catch (error: unknown) {
    if (isDuplicateKeyError(error) === "slug") {
      throw new CategoryMutationError(CATEGORY_ERRORS.DUPLICATE_SLUG, {
        slug: CATEGORY_ERRORS.DUPLICATE_SLUG,
      });
    }

    throw error;
  }
}

export async function updateCategory(
  id: string,
  fields: CategoryWriteFields,
): Promise<void> {
  await connectDB();

  try {
    const result = await Category.updateOne(
      { _id: id },
      {
        $set: {
          nameHe: fields.nameHe,
          nameEn: fields.nameEn,
          slug: fields.slug,
          sortOrder: fields.sortOrder,
          isActive: fields.isActive,
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new CategoryMutationError(CATEGORY_ERRORS.GENERIC);
    }
  } catch (error: unknown) {
    if (error instanceof CategoryMutationError) {
      throw error;
    }

    if (isDuplicateKeyError(error) === "slug") {
      throw new CategoryMutationError(CATEGORY_ERRORS.DUPLICATE_SLUG, {
        slug: CATEGORY_ERRORS.DUPLICATE_SLUG,
      });
    }

    throw error;
  }
}
