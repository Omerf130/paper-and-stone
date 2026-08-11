import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Product, { type IProduct } from "@/models/Product";
import type { AdminProductMediaView } from "@/types/admin-product-media";
import {
  mapGalleryToAdmin,
  mapMediaItemToAdmin,
} from "./mapProductMediaToAdmin";

export async function getAdminProductMediaById(
  productId: string,
): Promise<AdminProductMediaView | null> {
  if (!Types.ObjectId.isValid(productId)) {
    return null;
  }

  await connectDB();

  const product = await Product.findById(productId)
    .select("nameHe media")
    .lean<Pick<IProduct, "nameHe" | "media">>();

  if (!product) {
    return null;
  }

  return {
    productId,
    productNameHe: product.nameHe,
    primaryImage: mapMediaItemToAdmin(product.media?.primaryImage),
    gallery: mapGalleryToAdmin(product.media?.gallery),
    technicalDrawing: mapMediaItemToAdmin(product.media?.technicalDrawing),
  };
}

export async function productExists(productId: string): Promise<boolean> {
  if (!Types.ObjectId.isValid(productId)) {
    return false;
  }

  await connectDB();
  const count = await Product.countDocuments({ _id: productId });
  return count > 0;
}

export async function getProductSlug(productId: string): Promise<string | null> {
  if (!Types.ObjectId.isValid(productId)) {
    return null;
  }

  await connectDB();
  const product = await Product.findById(productId).select("slug").lean<{ slug: string }>();
  return product?.slug ?? null;
}

export async function getGalleryCount(productId: string): Promise<number> {
  if (!Types.ObjectId.isValid(productId)) {
    return 0;
  }

  await connectDB();
  const product = await Product.findById(productId)
    .select("media.gallery")
    .lean<{ media?: { gallery?: unknown[] } }>();

  return product?.media?.gallery?.length ?? 0;
}
