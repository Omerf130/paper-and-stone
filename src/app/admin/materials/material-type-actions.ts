"use server";

import { requireAdmin } from "@/lib/auth/authorization";
import {
  createMaterialType,
  MaterialTypeMutationError,
} from "@/lib/materials/material-type-mutations";
import {
  mapMaterialTypeInputToWriteFields,
  MATERIAL_TYPE_ERRORS,
  parseMaterialTypeFormInput,
} from "@/lib/materials/material-type-validation";
import type {
  AdminMaterialTypeFormInput,
  MaterialTypeFormState,
} from "@/types/admin-material-type";

export async function createMaterialTypeAction(
  input: AdminMaterialTypeFormInput,
): Promise<MaterialTypeFormState> {
  await requireAdmin();

  const parsed = parseMaterialTypeFormInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    const createdKey = await createMaterialType(
      mapMaterialTypeInputToWriteFields(parsed.data),
    );
    return { success: true, createdKey };
  } catch (error: unknown) {
    if (error instanceof MaterialTypeMutationError) {
      return {
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    return { error: MATERIAL_TYPE_ERRORS.GENERIC };
  }
}
