import type { ICategory } from "@/models/Category";
import type { IProduct } from "@/models/Product";
import {
  mapGalleryToPublic,
  mapPrimaryImageToPublic,
  mapTechnicalDrawingToPublic,
} from "@/lib/media/mapProductMediaToPublic";
import { mapLegacyFabricsToMaterialOptionsView } from "@/lib/products/material-options/mapLegacyFabricsToMaterialOptionsView";
import { mapProductMaterialOptionsToView } from "@/lib/products/material-options/mapProductMaterialOptionsToView";
import type {
  ProductDimensionsView,
  ProductMaterialOptionView,
  ProductSizeView,
  ProductView,
} from "@/types/product";

type PopulatedCategory = Pick<ICategory, "nameHe">;

type LeanProduct = Omit<IProduct, "categoryId"> & {
  categoryId: PopulatedCategory | null;
};

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

async function resolveMaterialOptions(
  product: LeanProduct,
): Promise<ProductMaterialOptionView[]> {
  if (product.materialOptions?.length > 0) {
    return mapProductMaterialOptionsToView(product.materialOptions);
  }

  if (product.fabrics?.length > 0) {
    return mapLegacyFabricsToMaterialOptionsView(product.fabrics);
  }

  return [];
}

export async function mapProductToView(
  product: LeanProduct,
): Promise<ProductView> {
  const fallbackAlt = product.nameHe;
  const materialOptions = await resolveMaterialOptions(product);

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
    materialOptions,
    sizes: mapSizes(product.sizes ?? []),
    primaryImage: mapPrimaryImageToPublic(
      product.media?.primaryImage,
      fallbackAlt,
    ),
    gallery: mapGalleryToPublic(product.media?.gallery, fallbackAlt),
    technicalDrawing: mapTechnicalDrawingToPublic(
      product.media?.technicalDrawing,
      `${fallbackAlt} — שרטוט טכני`,
    ),
  };
}
