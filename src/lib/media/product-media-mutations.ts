import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Product, { type IProductMediaItem } from "@/models/Product";
import type { MediaSlot } from "@/types/admin-product-media";
import type { ProductMediaType } from "@/types/product-media";
import { getMediaStorageProvider } from "./get-media-storage-provider";
import { GALLERY_MAX_COUNT } from "./media-validation";

export type UploadedBlobMetadata = {
  pathname: string;
  url: string;
  contentType?: string;
  downloadUrl?: string;
};

export type PersistUploadInput = {
  productId: string;
  slot: MediaSlot;
  altText?: string;
  blob: UploadedBlobMetadata;
  originalFilename: string;
  byteSize: number;
};

export class ProductMediaMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductMediaMutationError";
  }
}

function extractFilenameFromPathname(pathname: string): string {
  const parts = pathname.split("/");
  const last = parts[parts.length - 1] ?? "file";
  const dashIndex = last.indexOf("-");
  if (dashIndex >= 0 && dashIndex < last.length - 1) {
    return last.slice(dashIndex + 1);
  }
  return last;
}

function buildMediaItem(
  blob: UploadedBlobMetadata,
  mediaType: ProductMediaType,
  altText: string | undefined,
  sortOrder: number,
  originalFilename: string,
  byteSize: number,
): Omit<IProductMediaItem, "_id"> {
  return {
    storageKey: blob.pathname,
    url: blob.url,
    mediaType,
    mimeType: blob.contentType ?? "application/octet-stream",
    originalFilename: originalFilename || extractFilenameFromPathname(blob.pathname),
    byteSize,
    altText: altText?.trim() || undefined,
    sortOrder,
    createdAt: new Date(),
  };
}

async function findProductMedia(productId: string) {
  await connectDB();
  return Product.findById(productId);
}

export async function persistUploadedMedia(
  input: PersistUploadInput,
): Promise<{ oldStorageKey: string | null }> {
  const { productId, slot, altText, blob, originalFilename, byteSize } = input;
  const mediaType = slot === "technical" ? "TECHNICAL_DRAWING" : "PRODUCT_IMAGE";

  const product = await findProductMedia(productId);
  if (!product) {
    throw new ProductMediaMutationError("מוצר לא נמצא.");
  }

  if (!product.media) {
    product.media = { gallery: [] };
  }

  if (slot === "gallery" && (product.media.gallery?.length ?? 0) >= GALLERY_MAX_COUNT) {
    throw new ProductMediaMutationError("ניתן להוסיף עד 8 תמונות לגלריה.");
  }

  const itemData = buildMediaItem(
    blob,
    mediaType,
    altText,
    slot === "gallery" ? (product.media.gallery?.length ?? 0) : 0,
    originalFilename,
    byteSize,
  );

  let oldStorageKey: string | null = null;

  if (slot === "primary") {
    oldStorageKey = product.media.primaryImage?.storageKey ?? null;
    product.media.primaryImage = itemData as IProductMediaItem;
  } else if (slot === "technical") {
    oldStorageKey = product.media.technicalDrawing?.storageKey ?? null;
    product.media.technicalDrawing = itemData as IProductMediaItem;
  } else {
    product.media.gallery = product.media.gallery ?? [];
    product.media.gallery.push(itemData as IProductMediaItem);
  }

  product.markModified("media");
  await product.save();

  return { oldStorageKey };
}

export async function deleteOldBlobBestEffort(storageKey: string | null): Promise<void> {
  if (!storageKey) {
    return;
  }

  const provider = getMediaStorageProvider();
  await provider.delete(storageKey);
}

export async function rollbackNewBlobBestEffort(storageKey: string): Promise<void> {
  await deleteOldBlobBestEffort(storageKey);
}

export async function mediaItemExistsByStorageKey(
  productId: string,
  storageKey: string,
): Promise<boolean> {
  const product = await findProductMedia(productId);
  if (!product?.media) {
    return false;
  }

  if (product.media.primaryImage?.storageKey === storageKey) {
    return true;
  }

  if (product.media.technicalDrawing?.storageKey === storageKey) {
    return true;
  }

  return (product.media.gallery ?? []).some(
    (item) => item.storageKey === storageKey,
  );
}

export async function deletePrimaryImage(productId: string): Promise<string | null> {
  const product = await findProductMedia(productId);
  if (!product?.media?.primaryImage) {
    return null;
  }

  const storageKey = product.media.primaryImage.storageKey;
  product.media.primaryImage = undefined;
  product.markModified("media");
  await product.save();
  return storageKey;
}

export async function deleteTechnicalDrawing(
  productId: string,
): Promise<string | null> {
  const product = await findProductMedia(productId);
  if (!product?.media?.technicalDrawing) {
    return null;
  }

  const storageKey = product.media.technicalDrawing.storageKey;
  product.media.technicalDrawing = undefined;
  product.markModified("media");
  await product.save();
  return storageKey;
}

export async function deleteGalleryImage(
  productId: string,
  mediaItemId: string,
): Promise<string | null> {
  if (!Types.ObjectId.isValid(mediaItemId)) {
    return null;
  }

  const product = await findProductMedia(productId);
  if (!product?.media?.gallery?.length) {
    return null;
  }

  const index = product.media.gallery.findIndex(
    (item) => item._id.toString() === mediaItemId,
  );

  if (index < 0) {
    return null;
  }

  const [removed] = product.media.gallery.splice(index, 1);
  product.media.gallery.forEach((item, idx) => {
    item.sortOrder = idx;
  });
  product.markModified("media");
  await product.save();
  return removed.storageKey;
}

export async function moveGalleryImage(
  productId: string,
  mediaItemId: string,
  direction: "up" | "down",
): Promise<boolean> {
  if (!Types.ObjectId.isValid(mediaItemId)) {
    return false;
  }

  const product = await findProductMedia(productId);
  const gallery = product?.media?.gallery;
  if (!gallery?.length) {
    return false;
  }

  const sorted = gallery.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const index = sorted.findIndex((item) => item._id.toString() === mediaItemId);
  if (index < 0) {
    return false;
  }

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= sorted.length) {
    return false;
  }

  const currentOrder = sorted[index].sortOrder;
  sorted[index].sortOrder = sorted[swapIndex].sortOrder;
  sorted[swapIndex].sortOrder = currentOrder;

  product!.markModified("media");
  await product!.save();
  return true;
}

export async function updatePrimaryAltText(
  productId: string,
  altText: string,
): Promise<boolean> {
  const product = await findProductMedia(productId);
  if (!product?.media?.primaryImage) {
    return false;
  }

  product.media.primaryImage.altText = altText.trim() || undefined;
  product.markModified("media");
  await product.save();
  return true;
}

export async function updateGalleryAltText(
  productId: string,
  mediaItemId: string,
  altText: string,
): Promise<boolean> {
  if (!Types.ObjectId.isValid(mediaItemId)) {
    return false;
  }

  const product = await findProductMedia(productId);
  const item = product?.media?.gallery?.find(
    (galleryItem) => galleryItem._id.toString() === mediaItemId,
  );

  if (!item) {
    return false;
  }

  item.altText = altText.trim() || undefined;
  product!.markModified("media");
  await product!.save();
  return true;
}

export async function updateTechnicalAltText(
  productId: string,
  altText: string,
): Promise<boolean> {
  const product = await findProductMedia(productId);
  if (!product?.media?.technicalDrawing) {
    return false;
  }

  product.media.technicalDrawing.altText = altText.trim() || undefined;
  product.markModified("media");
  await product.save();
  return true;
}

export async function applyUploadWithReplace(
  input: PersistUploadInput,
): Promise<void> {
  let oldStorageKey: string | null = null;
  const newStorageKey = input.blob.pathname;

  try {
    const result = await persistUploadedMedia(input);
    oldStorageKey = result.oldStorageKey;
    await deleteOldBlobBestEffort(oldStorageKey);
  } catch (error: unknown) {
    await rollbackNewBlobBestEffort(newStorageKey);
    throw error;
  }
}

export async function applyUploadIdempotent(
  input: PersistUploadInput,
): Promise<void> {
  const exists = await mediaItemExistsByStorageKey(
    input.productId,
    input.blob.pathname,
  );

  if (exists) {
    return;
  }

  await applyUploadWithReplace(input);
}
