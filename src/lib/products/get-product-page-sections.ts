import { hasProductDimensions } from "@/lib/products/product-display-helpers";
import type { ProductView } from "@/types/product";

export type ProductPageSections = {
  showGallery: boolean;
  showDrawingSwitch: boolean;
  showConfiguratorOptions: boolean;
  showSizeSelector: boolean;
  showLongDescription: boolean;
  showTechnicalInfo: boolean;
};

function buildProductImageCount(product: ProductView): number {
  const urls = new Set<string>();
  if (product.primaryImage) {
    urls.add(product.primaryImage.url);
  }
  for (const image of product.gallery) {
    urls.add(image.url);
  }
  return urls.size;
}

export function getProductPageSections(product: ProductView): ProductPageSections {
  const showDimensions = hasProductDimensions(product.dimensions);
  const hasMaterials = product.materials.length > 0;
  const hasMaintenance = product.maintenance.trim().length > 0;
  const hasWarranty = product.warranty.trim().length > 0;
  const hasCountry = product.countryOfOrigin.trim().length > 0;
  const hasConfiguratorOptions =
    product.materialOptions.length > 0 || product.sizes.length > 0;

  return {
    showGallery: buildProductImageCount(product) > 1,
    showDrawingSwitch:
      Boolean(product.technicalDrawing) || showDimensions,
    showConfiguratorOptions: hasConfiguratorOptions,
    showSizeSelector: product.sizes.length > 1,
    showLongDescription: product.longDescription.trim().length > 0,
    showTechnicalInfo:
      showDimensions || hasMaterials || hasMaintenance || hasWarranty || hasCountry,
  };
}

export function shouldShowSizeSelector(sizeCount: number): boolean {
  return sizeCount > 1;
}
