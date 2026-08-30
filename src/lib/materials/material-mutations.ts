import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Material from "@/models/Material";
import { isDuplicateCodeError } from "@/lib/shared/duplicate-key";
import {
  MATERIAL_ERRORS,
  type MaterialWriteFields,
} from "./material-validation";
import {
  buildMaterialSetFields,
  buildMaterialUnsetFields,
} from "./material-variant-helpers";
import { verifyMaterialTypeKey } from "./material-type-mutations";

export class MaterialMutationError extends Error {
  fieldErrors?: Record<string, string>;

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

async function assertValidMaterialType(typeKey: string): Promise<void> {
  const isValid = await verifyMaterialTypeKey(typeKey);
  if (!isValid) {
    throw new MaterialMutationError(MATERIAL_ERRORS.INVALID_TYPE, {
      type: MATERIAL_ERRORS.INVALID_TYPE,
    });
  }
}

export async function getMaterialColorIds(id: string): Promise<string[]> {
  const { getMaterialVariantIds } = await import(
    "./material-variant-helpers"
  );
  return getMaterialVariantIds(id);
}

export async function createMaterial(
  fields: MaterialWriteFields,
): Promise<string> {
  await connectDB();
  await assertValidMaterialType(fields.type);

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
  await assertValidMaterialType(fields.type);

  const unset = buildMaterialUnsetFields(fields);

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

export async function materialExists(id: string): Promise<boolean> {
  if (!Types.ObjectId.isValid(id)) {
    return false;
  }

  await connectDB();
  const material = await Material.findById(id).select("_id").lean();
  return Boolean(material);
}
