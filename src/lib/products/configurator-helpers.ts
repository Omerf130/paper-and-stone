import type {
  ProductMaterialOptionView,
  ProductView,
} from "@/types/product";
import {
  hasConfiguratorOptions,
  hasMaterials,
  hasSizes,
} from "./product-display-helpers";

export function getMaterialById(
  product: ProductView,
  materialId: string,
): ProductMaterialOptionView | undefined {
  return product.materialOptions.find(
    (option) => option.materialId === materialId,
  );
}

export function getColorById(
  material: ProductMaterialOptionView,
  colorId: string,
): ProductMaterialOptionView["colors"][number] | undefined {
  return material.colors.find((color) => color.id === colorId);
}

export function resolveValidColorId(
  material: ProductMaterialOptionView,
  currentColorId: string,
): string | null {
  const isValid = material.colors.some((color) => color.id === currentColorId);
  if (isValid) {
    return currentColorId;
  }

  return material.colors[0]?.id ?? null;
}

export type ConfiguratorState = {
  materialId: string | null;
  colorId: string | null;
  sizeId: string | null;
  hasMaterials: boolean;
  hasSizes: boolean;
  hasConfiguratorOptions: boolean;
};

export function getConfiguratorState(product: ProductView): ConfiguratorState {
  const materialsAvailable = hasMaterials(product);
  const sizesAvailable = hasSizes(product);
  const firstMaterial = materialsAvailable
    ? product.materialOptions[0]
    : undefined;
  const firstColor = firstMaterial?.colors[0];

  return {
    materialId: firstMaterial?.materialId ?? null,
    colorId: firstColor?.id ?? null,
    sizeId: sizesAvailable ? (product.sizes[0]?.id ?? null) : null,
    hasMaterials: materialsAvailable,
    hasSizes: sizesAvailable,
    hasConfiguratorOptions: hasConfiguratorOptions(product),
  };
}
