"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/authorization";
import {
  createProduct,
  mapProductInputToWriteFields,
  ProductMutationError,
  updateProduct,
} from "@/lib/products/product-mutations";
import {
  parseProductFormInput,
  PRODUCT_ERRORS,
} from "@/lib/products/product-validation";
import type {
  AdminProductFormInput,
  ProductFormState,
} from "@/types/admin-product";

export async function createProductAction(
  input: AdminProductFormInput,
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = parseProductFormInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  let productId: string;

  try {
    productId = await createProduct(
      mapProductInputToWriteFields(parsed.data),
    );
  } catch (error: unknown) {
    if (error instanceof ProductMutationError) {
      return {
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    return { error: PRODUCT_ERRORS.GENERIC };
  }

  redirect(`/admin/products/${productId}?saved=1`);
}

export async function updateProductAction(
  productId: string,
  input: AdminProductFormInput,
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = parseProductFormInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    await updateProduct(
      productId,
      mapProductInputToWriteFields(parsed.data),
    );
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProductMutationError) {
      return {
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    return { error: PRODUCT_ERRORS.GENERIC };
  }
}
