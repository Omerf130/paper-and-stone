import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Color from "@/models/Color";
import Material from "@/models/Material";
import Product from "@/models/Product";
import type { AdminMaterialProductLink } from "@/types/admin-material";
import {
  findVariantById,
  getVariantIdsFromMaterial,
} from "./material-variant-helpers";
import { verifyProductMaterialOptions } from "@/lib/products/material-options/verifyProductMaterialOptions";
import type { ProductMaterialOptionInput } from "@/lib/products/material-options/product-material-option-input";

export async function getProductsUsingMaterial(
  materialId: string,
): Promise<AdminMaterialProductLink[]> {
  if (!Types.ObjectId.isValid(materialId)) {
    return [];
  }

  await connectDB();

  const products = await Product.find({
    "materialOptions.materialId": materialId,
  })
    .select("nameHe sku materialOptions")
    .sort({ nameHe: 1 })
    .lean();

  return products.map((product) => {
    const option = product.materialOptions?.find(
      (entry) => entry.materialId.toString() === materialId,
    );

    return {
      productId: product._id.toString(),
      nameHe: product.nameHe,
      sku: product.sku,
      allowedVariantIds: (option?.allowedColorIds ?? []).map((id) =>
        id.toString(),
      ),
    };
  });
}

export async function linkMaterialToProduct(
  materialId: string,
  productId: string,
  allowedVariantIds: string[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (
    !Types.ObjectId.isValid(materialId) ||
    !Types.ObjectId.isValid(productId)
  ) {
    return { ok: false, message: "מזהה לא תקין" };
  }

  await connectDB();

  const product = await Product.findById(productId)
    .select("materialOptions")
    .lean();

  if (!product) {
    return { ok: false, message: "המוצר לא נמצא" };
  }

  const previous = (product.materialOptions ?? []).map((option) => ({
    materialId: option.materialId.toString(),
    allowedColorIds: option.allowedColorIds.map((id) => id.toString()),
  }));

  const withoutMaterial = previous.filter(
    (option) => option.materialId !== materialId,
  );

  const nextOptions: ProductMaterialOptionInput[] = [
    ...withoutMaterial,
    { materialId, allowedColorIds: allowedVariantIds },
  ];

  const verification = await verifyProductMaterialOptions(nextOptions, previous);
  if (!verification.ok) {
    return { ok: false, message: verification.message };
  }

  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        materialOptions: nextOptions.map((option) => ({
          materialId: new Types.ObjectId(option.materialId),
          allowedColorIds: option.allowedColorIds.map(
            (id) => new Types.ObjectId(id),
          ),
        })),
      },
    },
  );

  return { ok: true };
}

export async function unlinkMaterialFromProduct(
  materialId: string,
  productId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (
    !Types.ObjectId.isValid(materialId) ||
    !Types.ObjectId.isValid(productId)
  ) {
    return { ok: false, message: "מזהה לא תקין" };
  }

  await connectDB();

  const product = await Product.findById(productId)
    .select("materialOptions")
    .lean();

  if (!product) {
    return { ok: false, message: "המוצר לא נמצא" };
  }

  const previous = (product.materialOptions ?? []).map((option) => ({
    materialId: option.materialId.toString(),
    allowedColorIds: option.allowedColorIds.map((id) => id.toString()),
  }));

  const nextOptions = previous.filter(
    (option) => option.materialId !== materialId,
  );

  const verification = await verifyProductMaterialOptions(nextOptions, previous);
  if (!verification.ok) {
    return { ok: false, message: verification.message };
  }

  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        materialOptions: nextOptions.map((option) => ({
          materialId: new Types.ObjectId(option.materialId),
          allowedColorIds: option.allowedColorIds.map(
            (id) => new Types.ObjectId(id),
          ),
        })),
      },
    },
  );

  return { ok: true };
}

export async function getMaterialVariantOptions(materialId: string) {
  if (!Types.ObjectId.isValid(materialId)) {
    return [];
  }

  await connectDB();

  const material = await Material.findById(materialId)
    .select("variants colorIds")
    .lean();

  if (!material) {
    return [];
  }

  if (material.variants?.length) {
    return material.variants.map((variant) => ({
      id: variant._id.toString(),
      name: variant.name,
      hex: variant.hex,
      swatchImageUrl: variant.swatchImage?.url,
      isActive: variant.isActive,
    }));
  }

  const colorIds = getVariantIdsFromMaterial(material);
  if (colorIds.length === 0) {
    return [];
  }

  const colors = await Color.find({ _id: { $in: colorIds } })
    .select("nameHe hex isActive")
    .lean();

  return colors.map((color) => ({
    id: color._id.toString(),
    name: color.nameHe,
    hex: color.hex,
    isActive: color.isActive,
  }));
}

export async function getUnlinkedProductsForMaterial(materialId: string) {
  if (!Types.ObjectId.isValid(materialId)) {
    return [];
  }

  await connectDB();

  const products = await Product.find({
    "materialOptions.materialId": { $ne: new Types.ObjectId(materialId) },
  })
    .select("nameHe sku")
    .sort({ nameHe: 1 })
    .limit(200)
    .lean();

  return products.map((product) => ({
    id: product._id.toString(),
    nameHe: product.nameHe,
    sku: product.sku,
  }));
}

export { findVariantById };
