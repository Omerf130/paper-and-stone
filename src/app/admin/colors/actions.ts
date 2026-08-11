"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/authorization";
import {
  ColorMutationError,
  createColor,
  updateColor,
} from "@/lib/colors/color-mutations";
import {
  COLOR_ERRORS,
  mapColorInputToWriteFields,
  parseColorFormInput,
} from "@/lib/colors/color-validation";
import type {
  AdminColorFormInput,
  ColorFormState,
} from "@/types/admin-color";

export async function createColorAction(
  input: AdminColorFormInput,
): Promise<ColorFormState> {
  await requireAdmin();

  const parsed = parseColorFormInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  const writeFields = mapColorInputToWriteFields(parsed.data);
  if ("fieldErrors" in writeFields) {
    return { fieldErrors: writeFields.fieldErrors };
  }

  let colorId: string;

  try {
    colorId = await createColor(writeFields);
  } catch (error: unknown) {
    if (error instanceof ColorMutationError) {
      return {
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    return { error: COLOR_ERRORS.GENERIC };
  }

  redirect(`/admin/colors/${colorId}?saved=1`);
}

export async function updateColorAction(
  colorId: string,
  input: AdminColorFormInput,
): Promise<ColorFormState> {
  await requireAdmin();

  const parsed = parseColorFormInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  const writeFields = mapColorInputToWriteFields(parsed.data);
  if ("fieldErrors" in writeFields) {
    return { fieldErrors: writeFields.fieldErrors };
  }

  try {
    await updateColor(colorId, writeFields);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ColorMutationError) {
      return {
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    return { error: COLOR_ERRORS.GENERIC };
  }
}
