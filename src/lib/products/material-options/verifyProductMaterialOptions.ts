import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Color from "@/models/Color";
import Material from "@/models/Material";
import {
  findVariantById,
  getVariantIdsFromMaterial,
} from "@/lib/materials/material-variant-helpers";
import { PRODUCT_MATERIAL_OPTION_ERRORS } from "./material-option-errors";
import {
  normalizeProductMaterialOptionInput,
  type ProductMaterialOptionInput,
} from "./product-material-option-input";

export type VerifyProductMaterialOptionsResult =
  | { ok: true; materialOptions: ProductMaterialOptionInput[] }
  | { ok: false; message: string; field: string };

function buildPreviousMaps(previous: ProductMaterialOptionInput[]) {
  const materialIds = new Set<string>();
  const colorsByMaterial = new Map<string, Set<string>>();

  for (const option of previous) {
    materialIds.add(option.materialId);
    colorsByMaterial.set(
      option.materialId,
      new Set(option.allowedColorIds),
    );
  }

  return { materialIds, colorsByMaterial };
}

function isVariantInMaterialPalette(
  material: {
    variants?: Array<{ _id: Types.ObjectId; isActive: boolean }>;
    colorIds?: Types.ObjectId[];
  },
  variantId: string,
): boolean {
  if (material.variants?.length) {
    return material.variants.some(
      (variant) => variant._id.toString() === variantId,
    );
  }

  return (material.colorIds ?? []).some((id) => id.toString() === variantId);
}

function isVariantActive(
  material: {
    variants?: Array<{ _id: Types.ObjectId; isActive: boolean }>;
  },
  variantId: string,
  colorById: Map<string, { isActive: boolean }>,
): boolean {
  const variant = findVariantById(material, variantId);
  if (variant) {
    return variant.isActive ?? true;
  }

  const color = colorById.get(variantId);
  return color?.isActive ?? false;
}

export async function verifyProductMaterialOptions(
  submitted: ProductMaterialOptionInput[],
  previous: ProductMaterialOptionInput[] = [],
): Promise<VerifyProductMaterialOptionsResult> {
  const normalized = normalizeProductMaterialOptionInput(submitted);
  const { materialIds: previousMaterialIds, colorsByMaterial } =
    buildPreviousMaps(previous);

  const seenMaterialIds = new Set<string>();

  for (const option of normalized) {
    if (!Types.ObjectId.isValid(option.materialId)) {
      return {
        ok: false,
        message: PRODUCT_MATERIAL_OPTION_ERRORS.INVALID_MATERIAL_ID,
        field: "materialOptions",
      };
    }

    if (seenMaterialIds.has(option.materialId)) {
      return {
        ok: false,
        message: PRODUCT_MATERIAL_OPTION_ERRORS.DUPLICATE_MATERIAL,
        field: "materialOptions",
      };
    }

    seenMaterialIds.add(option.materialId);

    if (option.allowedColorIds.length === 0) {
      return {
        ok: false,
        message: PRODUCT_MATERIAL_OPTION_ERRORS.EMPTY_COLORS,
        field: "materialOptions",
      };
    }

    const seenColorIds = new Set<string>();
    for (const colorId of option.allowedColorIds) {
      if (!Types.ObjectId.isValid(colorId)) {
        return {
          ok: false,
          message: PRODUCT_MATERIAL_OPTION_ERRORS.INVALID_COLOR_ID,
          field: "materialOptions",
        };
      }

      if (seenColorIds.has(colorId)) {
        return {
          ok: false,
          message: PRODUCT_MATERIAL_OPTION_ERRORS.DUPLICATE_COLOR,
          field: "materialOptions",
        };
      }

      seenColorIds.add(colorId);
    }
  }

  if (normalized.length === 0) {
    return { ok: true, materialOptions: [] };
  }

  await connectDB();

  const materialIdList = normalized.map((option) => option.materialId);
  const allColorIds = [
    ...new Set(normalized.flatMap((option) => option.allowedColorIds)),
  ];

  const [materials, colors] = await Promise.all([
    Material.find({ _id: { $in: materialIdList } })
      .select("_id isActive variants colorIds")
      .lean(),
    Color.find({ _id: { $in: allColorIds } })
      .select("_id isActive")
      .lean(),
  ]);

  const materialById = new Map(
    materials.map((material) => [material._id.toString(), material]),
  );
  const colorById = new Map(
    colors.map((color) => [color._id.toString(), color]),
  );

  for (const option of normalized) {
    const material = materialById.get(option.materialId);
    if (!material) {
      return {
        ok: false,
        message: PRODUCT_MATERIAL_OPTION_ERRORS.MATERIAL_NOT_FOUND,
        field: "materialOptions",
      };
    }

    const isPreviouslyAssignedMaterial = previousMaterialIds.has(
      option.materialId,
    );

    if (!isPreviouslyAssignedMaterial && !material.isActive) {
      return {
        ok: false,
        message: PRODUCT_MATERIAL_OPTION_ERRORS.INACTIVE_MATERIAL,
        field: "materialOptions",
      };
    }

    const previousColorsForMaterial =
      colorsByMaterial.get(option.materialId) ?? new Set<string>();

    for (const variantId of option.allowedColorIds) {
      if (!isVariantInMaterialPalette(material, variantId)) {
        const color = colorById.get(variantId);
        if (!color) {
          return {
            ok: false,
            message: PRODUCT_MATERIAL_OPTION_ERRORS.COLOR_NOT_FOUND,
            field: "materialOptions",
          };
        }

        const paletteIds = getVariantIdsFromMaterial(material);
        if (!paletteIds.includes(variantId)) {
          return {
            ok: false,
            message: PRODUCT_MATERIAL_OPTION_ERRORS.COLOR_NOT_IN_MATERIAL,
            field: "materialOptions",
          };
        }
      }

      const isPreviouslyAssignedColor = previousColorsForMaterial.has(variantId);
      if (
        !isPreviouslyAssignedColor &&
        !isVariantActive(material, variantId, colorById)
      ) {
        return {
          ok: false,
          message: PRODUCT_MATERIAL_OPTION_ERRORS.INACTIVE_COLOR,
          field: "materialOptions",
        };
      }
    }
  }

  return { ok: true, materialOptions: normalized };
}

export async function getProductMaterialOptionsFromDb(
  productId: string,
): Promise<ProductMaterialOptionInput[]> {
  if (!Types.ObjectId.isValid(productId)) {
    return [];
  }

  await connectDB();

  const Product = (await import("@/models/Product")).default;
  const product = await Product.findById(productId)
    .select("materialOptions")
    .lean<{
      materialOptions?: {
        materialId: Types.ObjectId;
        allowedColorIds: Types.ObjectId[];
      }[];
    }>();

  if (!product?.materialOptions?.length) {
    return [];
  }

  return product.materialOptions.map((option) => ({
    materialId: option.materialId.toString(),
    allowedColorIds: option.allowedColorIds.map((id) => id.toString()),
  }));
}
