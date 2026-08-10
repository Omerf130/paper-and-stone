import type {
  ProductDimensionsView,
  ProductView,
  VisualTone,
} from "@/types/product";

export function hasProductDimensions(
  dimensions: ProductDimensionsView,
): boolean {
  return (
    (dimensions.width !== undefined && dimensions.width > 0) ||
    (dimensions.depth !== undefined && dimensions.depth > 0) ||
    (dimensions.height !== undefined && dimensions.height > 0) ||
    (dimensions.seatHeight !== undefined && dimensions.seatHeight > 0)
  );
}

export function hasFabrics(product: ProductView): boolean {
  return product.fabrics.length > 0;
}

export function hasSizes(product: ProductView): boolean {
  return product.sizes.length > 0;
}

export function hasConfiguratorOptions(product: ProductView): boolean {
  return hasFabrics(product) || hasSizes(product);
}

export function getDefaultVisualTone(product: ProductView): VisualTone {
  for (const fabric of product.fabrics) {
    const firstColor = fabric.colors[0];
    if (firstColor) {
      return firstColor.tone;
    }
  }

  return "gray";
}
