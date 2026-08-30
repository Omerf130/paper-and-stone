import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { formatAgorotToShekelsInput } from "@/lib/money/parse-money-input";
import Product from "@/models/Product";
import type { AdminProductFormInput } from "@/types/admin-product";

export async function getAdminProductById(
  id: string,
): Promise<AdminProductFormInput | null> {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectDB();

  const product = await Product.findById(id).lean();

  if (!product) {
    return null;
  }

  return {
    nameHe: product.nameHe,
    nameEn: product.nameEn ?? "",
    slug: product.slug,
    sku: product.sku,
    categoryId: product.categoryId.toString(),
    supplierId: product.supplierId?.toString() ?? "",
    internalCatalogName: product.internalCatalogName ?? "",
    catalogCode: product.catalogCode ?? "",
    brand: product.brand ?? "",
    designer: product.designer ?? "",
    shortDescription: product.shortDescription ?? "",
    longDescription: product.longDescription ?? "",
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    width: product.width?.toString() ?? "",
    depth: product.depth?.toString() ?? "",
    height: product.height?.toString() ?? "",
    seatHeight: product.seatHeight?.toString() ?? "",
    materials: product.materials ?? [],
    maintenance: product.maintenance ?? "",
    warranty: product.warranty ?? "",
    countryOfOrigin: product.countryOfOrigin ?? "",
    materialOptions: (product.materialOptions ?? []).map((option) => ({
      materialId: option.materialId.toString(),
      allowedColorIds: option.allowedColorIds.map((colorId) =>
        colorId.toString(),
      ),
    })),
    sizes: (product.sizes ?? []).map((size) => ({
      key: size.key,
      label: size.label,
    })),
    documents: (product.documents ?? []).map((document) => ({
      label: document.label,
      url: document.url,
      fileType: document.fileType ?? "",
    })),
    defaultInternalCostShekels:
      product.defaultInternalCostAgorot != null
        ? formatAgorotToShekelsInput(product.defaultInternalCostAgorot)
        : "",
  };
}
