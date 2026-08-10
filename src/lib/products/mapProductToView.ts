import type { ICategory } from "@/models/Category";
import type { IProduct } from "@/models/Product";
import {
  isVisualTone,
  type ProductColorView,
  type ProductDimensionsView,
  type ProductFabricView,
  type ProductSizeView,
  type ProductView,
  type VisualTone,
} from "@/types/product";

type PopulatedCategory = Pick<ICategory, "nameHe">;

type LeanProduct = Omit<IProduct, "categoryId"> & {
  categoryId: PopulatedCategory | null;
};

function toVisualTone(value: string | undefined, fallback: VisualTone): VisualTone {
  return isVisualTone(value) ? value : fallback;
}

function mapColors(
  colors: IProduct["fabrics"][number]["colors"],
  fallbackTone: VisualTone,
): ProductColorView[] {
  return colors.map((color) => ({
    id: color.key,
    label: color.label,
    tone: toVisualTone(color.visualTone, fallbackTone),
  }));
}

function mapFabrics(fabrics: IProduct["fabrics"]): ProductFabricView[] {
  return fabrics.map((fabric) => ({
    id: fabric.key,
    label: fabric.label,
    colors: mapColors(fabric.colors, "gray"),
  }));
}

function mapSizes(sizes: IProduct["sizes"]): ProductSizeView[] {
  return sizes.map((size) => ({
    id: size.key,
    label: size.label,
  }));
}

function mapDimensions(product: {
  width?: number;
  depth?: number;
  height?: number;
  seatHeight?: number;
}): ProductDimensionsView {
  const dimensions: ProductDimensionsView = {};

  if (product.width !== undefined && product.width > 0) {
    dimensions.width = product.width;
  }
  if (product.depth !== undefined && product.depth > 0) {
    dimensions.depth = product.depth;
  }
  if (product.height !== undefined && product.height > 0) {
    dimensions.height = product.height;
  }
  if (product.seatHeight !== undefined && product.seatHeight > 0) {
    dimensions.seatHeight = product.seatHeight;
  }

  return dimensions;
}

export function mapProductToView(product: LeanProduct): ProductView {
  return {
    slug: product.slug,
    name: product.nameEn ?? product.nameHe,
    nameHe: product.nameHe,
    brand: product.brand ?? "",
    designer: product.designer ?? "",
    sku: product.sku,
    category: product.categoryId?.nameHe ?? "",
    shortDescription: product.shortDescription ?? "",
    longDescription: product.longDescription ?? "",
    dimensions: mapDimensions(product),
    materials: product.materials ?? [],
    maintenance: product.maintenance ?? "",
    warranty: product.warranty ?? "",
    countryOfOrigin: product.countryOfOrigin ?? "",
    fabrics: mapFabrics(product.fabrics ?? []),
    sizes: mapSizes(product.sizes ?? []),
  };
}
