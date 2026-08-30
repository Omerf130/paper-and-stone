"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/authorization";
import {
  createMaterial,
  MaterialMutationError,
  updateMaterial,
} from "@/lib/materials/material-mutations";
import {
  mapMaterialInputToWriteFields,
  MATERIAL_ERRORS,
  parseMaterialFormInput,
} from "@/lib/materials/material-validation";
import type {
  AdminMaterialFormInput,
  MaterialFormState,
} from "@/types/admin-material";

export async function createMaterialAction(
  input: AdminMaterialFormInput,
): Promise<MaterialFormState> {
  await requireAdmin();

  const parsed = parseMaterialFormInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  const writeFields = mapMaterialInputToWriteFields(parsed.data);

  let materialId: string;

  try {
    materialId = await createMaterial(writeFields);
  } catch (error: unknown) {
    if (error instanceof MaterialMutationError) {
      return {
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    return { error: MATERIAL_ERRORS.GENERIC };
  }

  redirect(`/admin/materials/${materialId}?saved=1`);
}

export async function updateMaterialAction(
  materialId: string,
  input: AdminMaterialFormInput,
): Promise<MaterialFormState> {
  await requireAdmin();

  const parsed = parseMaterialFormInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  const writeFields = mapMaterialInputToWriteFields(parsed.data);

  try {
    await updateMaterial(materialId, writeFields);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof MaterialMutationError) {
      return {
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    return { error: MATERIAL_ERRORS.GENERIC };
  }
}
