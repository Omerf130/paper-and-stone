"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/authorization";
import {
  createSupplier,
  SupplierMutationError,
  updateSupplier,
} from "@/lib/suppliers/supplier-mutations";
import {
  mapSupplierInputToWriteFields,
  parseSupplierFormInput,
  SUPPLIER_ERRORS,
} from "@/lib/suppliers/supplier-validation";
import type {
  AdminSupplierFormInput,
  SupplierFormState,
} from "@/types/admin-supplier";

export async function createSupplierAction(
  input: AdminSupplierFormInput,
): Promise<SupplierFormState> {
  await requireAdmin();

  const parsed = parseSupplierFormInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  let supplierId: string;

  try {
    supplierId = await createSupplier(
      mapSupplierInputToWriteFields(parsed.data),
    );
  } catch (error: unknown) {
    if (error instanceof SupplierMutationError) {
      return {
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    return { error: SUPPLIER_ERRORS.GENERIC };
  }

  redirect(`/admin/suppliers/${supplierId}?saved=1`);
}

export async function updateSupplierAction(
  supplierId: string,
  input: AdminSupplierFormInput,
): Promise<SupplierFormState> {
  await requireAdmin();

  const parsed = parseSupplierFormInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    await updateSupplier(
      supplierId,
      mapSupplierInputToWriteFields(parsed.data),
    );
    return { success: true };
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
