"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/authorization";
import {
  createCategory,
  CategoryMutationError,
  updateCategory,
} from "@/lib/categories/category-mutations";
import {
  CATEGORY_ERRORS,
  mapCategoryInputToWriteFields,
  parseCategoryFormInput,
} from "@/lib/categories/category-validation";
import type {
  AdminCategoryFormInput,
  CategoryFormState,
} from "@/types/admin-category";

export async function createCategoryAction(
  input: AdminCategoryFormInput,
): Promise<CategoryFormState> {
  await requireAdmin();

  const parsed = parseCategoryFormInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  let categoryId: string;

  try {
    categoryId = await createCategory(
      mapCategoryInputToWriteFields(parsed.data),
    );
  } catch (error: unknown) {
    if (error instanceof CategoryMutationError) {
      return {
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    return { error: CATEGORY_ERRORS.GENERIC };
  }

  redirect(`/admin/categories/${categoryId}?saved=1`);
}

export async function updateCategoryAction(
  categoryId: string,
  input: AdminCategoryFormInput,
): Promise<CategoryFormState> {
  await requireAdmin();

  const parsed = parseCategoryFormInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    await updateCategory(
      categoryId,
      mapCategoryInputToWriteFields(parsed.data),
    );
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof CategoryMutationError) {
      return {
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    return { error: CATEGORY_ERRORS.GENERIC };
  }
}
