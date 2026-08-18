"use server";

import { requireProfessional } from "@/lib/auth/authorization";
import { searchProductsForProjectPicker } from "@/lib/projects/project-product-picker-queries";
import { verifyProjectPickerAccess } from "@/lib/projects/verify-project-picker-access";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { loadActiveProductBySlug } from "@/lib/projects/verifyProjectItemSelection";
import type { ProductPickerResult } from "@/lib/projects/project-product-picker-queries";
import type { ProductView } from "@/types/product";

export async function searchProductsForPickerAction(input: {
  projectId: string;
  query?: string;
  page?: number;
}): Promise<ProductPickerResult & { error?: string }> {
  const user = await requireProfessional();

  try {
    await verifyProjectPickerAccess(user.id, input.projectId);

    const result = await searchProductsForProjectPicker({
      query: input.query,
      page: input.page,
    });

    return result;
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return {
        products: [],
        total: 0,
        page: 1,
        pageSize: 16,
        totalPages: 0,
        error: error.message,
      };
    }

    return {
      products: [],
      total: 0,
      page: 1,
      pageSize: 16,
      totalPages: 0,
      error: "אירעה שגיאה בחיפוש מוצרים.",
    };
  }
}

export async function getProductForPickerAction(input: {
  projectId: string;
  productSlug: string;
}): Promise<{ product?: ProductView; error?: string }> {
  const user = await requireProfessional();

  try {
    await verifyProjectPickerAccess(user.id, input.projectId);

    const loaded = await loadActiveProductBySlug(input.productSlug);
    if (!loaded) {
      return { error: "המוצר לא נמצא." };
    }

    return { product: loaded.productView };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: "אירעה שגיאה בטעינת המוצר." };
  }
}
