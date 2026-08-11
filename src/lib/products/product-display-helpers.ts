import type {
  ProductDimensionsView,
  ProductView,
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

export function hasMaterials(product: ProductView): boolean {
  return product.materialOptions.length > 0;
}

export function hasSizes(product: ProductView): boolean {
  return product.sizes.length > 0;
}

export function hasConfiguratorOptions(product: ProductView): boolean {
  return hasMaterials(product) || hasSizes(product);
}
