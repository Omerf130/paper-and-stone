import { connectDB } from "@/lib/db/mongoose";
import Color from "@/models/Color";
import { isDuplicateCodeError } from "@/lib/shared/duplicate-key";
import {
  COLOR_ERRORS,
  type ColorWriteFields,
} from "./color-validation";

export class ColorMutationError extends Error {
  fieldErrors?: Record<string, string>;

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

function buildColorSetFields(fields: ColorWriteFields) {
  return {
    nameHe: fields.nameHe,
    nameEn: fields.nameEn,
    hex: fields.hex,
    sortOrder: fields.sortOrder,
    isActive: fields.isActive,
    ...(fields.code !== undefined ? { code: fields.code } : {}),
  };
}

function buildUnsetFields(fields: ColorWriteFields) {
  const unset: Record<string, 1> = {};
  if (fields.code === undefined) {
    unset.code = 1;
  }
  if (fields.nameEn === undefined) {
    unset.nameEn = 1;
  }
  return unset;
}

export async function createColor(fields: ColorWriteFields): Promise<string> {
  await connectDB();

  try {
    const color = await Color.create(buildColorSetFields(fields));
    return color._id.toString();
  } catch (error: unknown) {
    if (isDuplicateCodeError(error)) {
      throw new ColorMutationError(COLOR_ERRORS.DUPLICATE_CODE, {
        code: COLOR_ERRORS.DUPLICATE_CODE,
      });
    }

    throw error;
  }
}

export async function updateColor(
  id: string,
  fields: ColorWriteFields,
): Promise<void> {
  await connectDB();

  const unset = buildUnsetFields(fields);

  try {
    const result = await Color.updateOne(
      { _id: id },
      {
        $set: buildColorSetFields(fields),
        ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
      },
    );

    if (result.matchedCount === 0) {
      throw new ColorMutationError(COLOR_ERRORS.GENERIC);
    }
  } catch (error: unknown) {
    if (error instanceof ColorMutationError) {
      throw error;
    }

    if (isDuplicateCodeError(error)) {
      throw new ColorMutationError(COLOR_ERRORS.DUPLICATE_CODE, {
        code: COLOR_ERRORS.DUPLICATE_CODE,
      });
    }

    throw error;
  }
}
