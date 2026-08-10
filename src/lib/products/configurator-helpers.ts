import type {
  ProductFabricView,
  ProductView,
  VisualTone,
} from "@/types/product";
import {
  getDefaultVisualTone,
  hasConfiguratorOptions,
  hasFabrics,
  hasSizes,
} from "./product-display-helpers";

export function getFabricById(
  product: ProductView,
  fabricId: string,
): ProductFabricView | undefined {
  return product.fabrics.find((fabric) => fabric.id === fabricId);
}

export function getColorById(
  fabric: ProductFabricView,
  colorId: string,
): ProductFabricView["colors"][number] | undefined {
  return fabric.colors.find((color) => color.id === colorId);
}

export function resolveValidColorId(
  fabric: ProductFabricView,
  currentColorId: string,
): string | null {
  const isValid = fabric.colors.some((color) => color.id === currentColorId);
  if (isValid) {
    return currentColorId;
  }

  return fabric.colors[0]?.id ?? null;
}

export type ConfiguratorState = {
  fabricId: string | null;
  colorId: string | null;
  sizeId: string | null;
  visualTone: VisualTone;
  hasFabrics: boolean;
  hasSizes: boolean;
  hasConfiguratorOptions: boolean;
};

export function getConfiguratorState(product: ProductView): ConfiguratorState {
  const fabricsAvailable = hasFabrics(product);
  const sizesAvailable = hasSizes(product);
  const firstFabric = fabricsAvailable ? product.fabrics[0] : undefined;
  const firstColor = firstFabric?.colors[0];

  return {
    fabricId: firstFabric?.id ?? null,
    colorId: firstColor?.id ?? null,
    sizeId: sizesAvailable ? (product.sizes[0]?.id ?? null) : null,
    visualTone: getDefaultVisualTone(product),
    hasFabrics: fabricsAvailable,
    hasSizes: sizesAvailable,
    hasConfiguratorOptions: hasConfiguratorOptions(product),
  };
}
