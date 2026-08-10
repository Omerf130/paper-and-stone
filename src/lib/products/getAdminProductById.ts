import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Product, { type IProduct } from "@/models/Product";
import type { AdminProductFormInput } from "@/types/admin-product";
import { isVisualTone } from "@/types/product";

export async function getAdminProductById(
  id: string,
): Promise<AdminProductFormInput | null> {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectDB();

  const product = await Product.findById(id).lean<IProduct>();

  if (!product) {
    return null;
  }

  return {
    nameHe: product.nameHe,
    nameEn: product.nameEn ?? "",
    slug: product.slug,
    sku: product.sku,
    categoryId: product.categoryId.toString(),
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
    fabrics: (product.fabrics ?? []).map((fabric) => ({
      key: fabric.key,
      label: fabric.label,
      colors: (fabric.colors ?? []).map((color) => ({
        key: color.key,
        label: color.label,
        visualTone: isVisualTone(color.visualTone) ? color.visualTone : "gray",
      })),
    })),
    sizes: (product.sizes ?? []).map((size) => ({
      key: size.key,
      label: size.label,
    })),
  };
}
