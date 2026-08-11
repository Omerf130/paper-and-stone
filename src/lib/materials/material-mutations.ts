import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Material from "@/models/Material";
import { isDuplicateCodeError } from "@/lib/shared/duplicate-key";
import {
  MATERIAL_ERRORS,
  type MaterialWriteFields,
} from "./material-validation";

export class MaterialMutationError extends Error {
  fieldErrors?: Record<string, string>;

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

function buildMaterialSetFields(fields: MaterialWriteFields) {
  return {
    nameHe: fields.nameHe,
    nameEn: fields.nameEn,
    type: fields.type,
    sortOrder: fields.sortOrder,
    isActive: fields.isActive,
    colorIds: fields.colorIds.map((id) => new Types.ObjectId(id)),
    ...(fields.code !== undefined ? { code: fields.code } : {}),
  };
}

function buildUnsetFields(fields: MaterialWriteFields) {
  const unset: Record<string, 1> = {};
  if (fields.code === undefined) {
    unset.code = 1;
  }
  if (fields.nameEn === undefined) {
    unset.nameEn = 1;
  }
  return unset;
}

export async function getMaterialColorIds(id: string): Promise<string[]> {
  if (!Types.ObjectId.isValid(id)) {
    return [];
  }

  await connectDB();
  const material = await Material.findById(id).select("colorIds").lean();
  return (material?.colorIds ?? []).map((colorId) => colorId.toString());
}

export async function createMaterial(
  fields: MaterialWriteFields,
): Promise<string> {
  await connectDB();

  try {
    const material = await Material.create(buildMaterialSetFields(fields));
    return material._id.toString();
  } catch (error: unknown) {
    if (isDuplicateCodeError(error)) {
      throw new MaterialMutationError(MATERIAL_ERRORS.DUPLICATE_CODE, {
        code: MATERIAL_ERRORS.DUPLICATE_CODE,
      });
    }

    throw error;
  }
}

export async function updateMaterial(
  id: string,
  fields: MaterialWriteFields,
): Promise<void> {
  await connectDB();

  const unset = buildUnsetFields(fields);

  try {
    const result = await Material.updateOne(
      { _id: id },
      {
        $set: buildMaterialSetFields(fields),
        ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
      },
    );

    if (result.matchedCount === 0) {
      throw new MaterialMutationError(MATERIAL_ERRORS.GENERIC);
    }
  } catch (error: unknown) {
    if (error instanceof MaterialMutationError) {
      throw error;
    }

    if (isDuplicateCodeError(error)) {
      throw new MaterialMutationError(MATERIAL_ERRORS.DUPLICATE_CODE, {
        code: MATERIAL_ERRORS.DUPLICATE_CODE,
      });
    }

    throw error;
  }
}
