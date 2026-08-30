import { connectDB } from "@/lib/db/mongoose";
import MaterialType from "@/models/MaterialType";
import {
  BUILTIN_MATERIAL_TYPE_KEYS,
  BUILTIN_MATERIAL_TYPE_LABELS,
} from "@/types/material";
import {
  MATERIAL_TYPE_ERRORS,
  type MaterialTypeWriteFields,
} from "./material-type-validation";

export class MaterialTypeMutationError extends Error {
  fieldErrors?: Record<string, string>;

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

export async function seedBuiltinMaterialTypes(): Promise<void> {
  await connectDB();

  await Promise.all(
    BUILTIN_MATERIAL_TYPE_KEYS.map((key, index) =>
      MaterialType.updateOne(
        { key },
        {
          $setOnInsert: {
            key,
            labelEn: BUILTIN_MATERIAL_TYPE_LABELS[key],
            isBuiltIn: true,
            sortOrder: index,
            isActive: true,
          },
        },
        { upsert: true },
      ),
    ),
  );
}

export async function createMaterialType(
  fields: MaterialTypeWriteFields,
): Promise<string> {
  await connectDB();

  try {
    const materialType = await MaterialType.create({
      key: fields.key,
      labelEn: fields.labelEn,
      isBuiltIn: false,
      sortOrder: 1000,
      isActive: true,
    });

    return materialType.key;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new MaterialTypeMutationError(MATERIAL_TYPE_ERRORS.DUPLICATE_KEY, {
        key: MATERIAL_TYPE_ERRORS.DUPLICATE_KEY,
      });
    }

    throw error;
  }
}

export async function verifyMaterialTypeKey(
  typeKey: string,
): Promise<boolean> {
  await connectDB();
  await seedBuiltinMaterialTypes();

  const materialType = await MaterialType.findOne({
    key: typeKey,
    isActive: true,
  })
    .select("_id")
    .lean();

  return Boolean(materialType);
}
