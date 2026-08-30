"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/authorization";
import {
  createProduct,
  deleteProduct,
  mapProductInputToWriteFields,
  ProductMutationError,
  PRODUCT_DELETE_ERRORS,
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
import { createCategoryInline } from "@/lib/categories/createCategoryInline";
import {
  createSupplier,
  SupplierMutationError,
} from "@/lib/suppliers/supplier-mutations";
import {
  mapSupplierInputToWriteFields,
  parseSupplierFormInput,
  SUPPLIER_ERRORS,
} from "@/lib/suppliers/supplier-validation";
import type { AdminSupplierFormInput } from "@/types/admin-supplier";

export async function createCategoryInlineAction(nameHe: string): Promise<
  | { success: true; categoryId: string; nameHe: string }
  | { error: string }
> {
  await requireAdmin();

  const result = await createCategoryInline(nameHe);
  if (!result.ok) {
    return { error: result.message };
  }

  return {
    success: true,
    categoryId: result.categoryId,
    nameHe: result.nameHe,
  };
}

export async function createSupplierInlineAction(
  input: AdminSupplierFormInput,
): Promise<
  | { success: true; supplierId: string; name: string }
  | { error: string; fieldErrors?: Record<string, string> }
> {
  await requireAdmin();

  const parsed = parseSupplierFormInput(input);
  if (!parsed.success) {
    return { error: SUPPLIER_ERRORS.GENERIC, fieldErrors: parsed.fieldErrors };
  }

  try {
    const supplierId = await createSupplier(
      mapSupplierInputToWriteFields(parsed.data),
    );

    return {
      success: true,
      supplierId,
      name: parsed.data.name.trim(),
    };
  } catch (error: unknown) {
    if (error instanceof SupplierMutationError) {
      return {
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    return { error: SUPPLIER_ERRORS.GENERIC };
  }
}

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

export async function deleteProductAction(
  productId: string,
): Promise<{ success: true } | { error: string }> {
  await requireAdmin();

  try {
    await deleteProduct(productId);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProductMutationError) {
      return { error: error.message };
    }

    return { error: PRODUCT_DELETE_ERRORS.GENERIC };
  }
}
