"use server";

import { requireAdmin } from "@/lib/auth/authorization";
import {
  getProductsUsingMaterial,
  getUnlinkedProductsForMaterial,
  linkMaterialToProduct,
  unlinkMaterialFromProduct,
} from "@/lib/materials/material-product-links";
import type { AdminMaterialProductLink } from "@/types/admin-material";

export async function fetchMaterialProductLinksAction(
  materialId: string,
): Promise<AdminMaterialProductLink[]> {
  await requireAdmin();
  return getProductsUsingMaterial(materialId);
}

export async function fetchUnlinkedProductsAction(materialId: string) {
  await requireAdmin();
  return getUnlinkedProductsForMaterial(materialId);
}

export async function linkMaterialProductAction(
  materialId: string,
  productId: string,
  allowedVariantIds: string[],
): Promise<{ success: true } | { error: string }> {
  await requireAdmin();

  const result = await linkMaterialToProduct(
    materialId,
    productId,
    allowedVariantIds,
  );

  if (!result.ok) {
    return { error: result.message };
  }

  return { success: true };
}

export async function unlinkMaterialProductAction(
  materialId: string,
  productId: string,
): Promise<{ success: true } | { error: string }> {
  await requireAdmin();

  const result = await unlinkMaterialFromProduct(materialId, productId);

  if (!result.ok) {
    return { error: result.message };
  }

  return { success: true };
}
