import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Material from "@/models/Material";
import type { IMaterialVariant } from "@/models/Material";
import type { MaterialVariantInput } from "@/types/material-variant";
import type { MaterialWriteFields } from "./material-validation";

export function buildStoredVariants(
  variants: MaterialVariantInput[],
): IMaterialVariant[] {
  return variants.map((variant) => {
    const id =
      variant.id && Types.ObjectId.isValid(variant.id)
        ? new Types.ObjectId(variant.id)
        : new Types.ObjectId();

    return {
      _id: id,
      name: variant.name,
      hex: variant.hex,
      swatchImage: variant.swatchImage,
      isActive: variant.isActive,
    };
  });
}

export function getVariantIdsFromMaterial(material: {
  variants?: IMaterialVariant[];
  colorIds?: Types.ObjectId[];
}): string[] {
  if (material.variants?.length) {
    return material.variants.map((variant) => variant._id.toString());
  }

  return (material.colorIds ?? []).map((id) => id.toString());
}

export function getActiveVariantIds(material: {
  variants?: IMaterialVariant[];
}): string[] {
  return (material.variants ?? [])
    .filter((variant) => variant.isActive)
    .map((variant) => variant._id.toString());
}

export function findVariantById(
  material: {
    variants?: Array<{ _id: { toString(): string }; name?: string; isActive?: boolean }>;
  },
  variantId: string,
) {
  return material.variants?.find(
    (variant) => variant._id.toString() === variantId,
  );
}

export function syncColorIdsFromVariants(
  variants: IMaterialVariant[],
): Types.ObjectId[] {
  return variants.map((variant) => variant._id);
}

export async function getMaterialVariantIds(id: string): Promise<string[]> {
  if (!Types.ObjectId.isValid(id)) {
    return [];
  }

  await connectDB();
  const material = await Material.findById(id)
    .select("variants colorIds")
    .lean();

  if (!material) {
    return [];
  }

  return getVariantIdsFromMaterial(material);
}

export function buildMaterialSetFields(fields: MaterialWriteFields) {
  const variants = buildStoredVariants(fields.variants);

  return {
    nameEn: fields.nameEn,
    nameHe: fields.nameHe ?? fields.nameEn,
    type: fields.type,
    isActive: fields.isActive,
    variants,
    colorIds: syncColorIdsFromVariants(variants),
    ...(fields.code !== undefined ? { code: fields.code } : {}),
  };
}

export function buildMaterialUnsetFields(fields: MaterialWriteFields) {
  const unset: Record<string, 1> = {};
  if (fields.code === undefined) {
    unset.code = 1;
  }
  return unset;
}
