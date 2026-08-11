export type ProductMaterialOptionInput = {
  materialId: string;
  allowedColorIds: string[];
};

export type StoredProductMaterialOption = {
  materialId: string;
  allowedColorIds: string[];
};

export function normalizeProductMaterialOptionInput(
  options: ProductMaterialOptionInput[],
): ProductMaterialOptionInput[] {
  const seenMaterials = new Set<string>();
  const result: ProductMaterialOptionInput[] = [];

  for (const option of options) {
    if (seenMaterials.has(option.materialId)) {
      continue;
    }

    seenMaterials.add(option.materialId);

    const seenColors = new Set<string>();
    const allowedColorIds: string[] = [];

    for (const colorId of option.allowedColorIds) {
      if (!seenColors.has(colorId)) {
        seenColors.add(colorId);
        allowedColorIds.push(colorId);
      }
    }

    result.push({
      materialId: option.materialId,
      allowedColorIds,
    });
  }

  return result;
}

export function toStoredProductMaterialOptions(
  options: ProductMaterialOptionInput[],
): StoredProductMaterialOption[] {
  return normalizeProductMaterialOptionInput(options);
}
