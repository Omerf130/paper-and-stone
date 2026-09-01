"use server";

import { Types } from "mongoose";
import { requireAdmin } from "@/lib/auth/authorization";
import { buildStoragePath, isPathnameInSlotNamespace } from "@/lib/media/build-storage-path";
import {
  getAdminProductMediaById,
  getGalleryCount,
  productExists,
} from "@/lib/media/getAdminProductMediaById";
import {
  GALLERY_MAX_COUNT,
  MEDIA_ERRORS,
  mediaSlotSchema,
} from "@/lib/media/media-validation";
import {
  applyUploadIdempotent,
  deleteGalleryImage,
  deleteOldBlobBestEffort,
  deletePrimaryImage,
  deleteRecolorMask,
  deleteTechnicalDrawing,
  moveGalleryImage,
  ProductMediaMutationError,
  setRecolorEnabled,
  updateGalleryAltText,
  updatePrimaryAltText,
  updateTechnicalAltText,
} from "@/lib/media/product-media-mutations";
import { revalidateProductMediaPaths } from "@/lib/media/revalidate-product-media-paths";
import { getProductSlug } from "@/lib/media/getAdminProductMediaById";
import type { ContentBounds } from "@/lib/media/detect-background-content-bounds";
import { trimProductImageBuffer } from "@/lib/media/trim-product-image";
import type { MediaSlot } from "@/types/admin-product-media";

export type MediaActionState = {
  error?: string;
  success?: boolean;
};

async function revalidateForProduct(productId: string): Promise<void> {
  const slug = await getProductSlug(productId);
  await revalidateProductMediaPaths(slug);
}

function invalidProductState(): MediaActionState {
  return { error: MEDIA_ERRORS.INVALID_PRODUCT };
}

export async function prepareMediaUploadAction(
  productId: string,
  slot: MediaSlot,
  originalFilename: string,
  altText?: string,
): Promise<
  | { error: string }
  | { pathname: string; clientPayload: string }
> {
  await requireAdmin();

  if (!Types.ObjectId.isValid(productId)) {
    return { error: MEDIA_ERRORS.INVALID_PRODUCT };
  }

  const parsedSlot = mediaSlotSchema.safeParse(slot);
  if (!parsedSlot.success) {
    return { error: MEDIA_ERRORS.INVALID_SLOT };
  }

  const exists = await productExists(productId);
  if (!exists) {
    return { error: MEDIA_ERRORS.INVALID_PRODUCT };
  }

  if (parsedSlot.data === "gallery") {
    const count = await getGalleryCount(productId);
    if (count >= GALLERY_MAX_COUNT) {
      return { error: MEDIA_ERRORS.GALLERY_FULL };
    }
  }

  if (parsedSlot.data === "recolor-mask") {
    const media = await getAdminProductMediaById(productId);
    if (!media?.primaryImage) {
      return { error: MEDIA_ERRORS.MASK_REQUIRES_PRIMARY };
    }
  }

  const pathname = buildStoragePath(productId, parsedSlot.data, originalFilename);
  const clientPayload = JSON.stringify({
    slot: parsedSlot.data,
    altText: altText?.trim() || undefined,
  });

  return { pathname, clientPayload };
}

export async function finalizeMediaUploadAction(input: {
  productId: string;
  slot: MediaSlot;
  pathname: string;
  url: string;
  contentType?: string;
  originalFilename: string;
  byteSize: number;
  altText?: string;
  width?: number;
  height?: number;
  normalized?: boolean;
}): Promise<MediaActionState> {
  await requireAdmin();

  if (!Types.ObjectId.isValid(input.productId)) {
    return invalidProductState();
  }

  const parsedSlot = mediaSlotSchema.safeParse(input.slot);
  if (!parsedSlot.success) {
    return { error: MEDIA_ERRORS.INVALID_SLOT };
  }

  const exists = await productExists(input.productId);
  if (!exists) {
    return invalidProductState();
  }

  if (
    !isPathnameInSlotNamespace(
      input.pathname,
      input.productId,
      parsedSlot.data,
    )
  ) {
    return { error: MEDIA_ERRORS.INVALID_PATHNAME };
  }

  try {
    await applyUploadIdempotent({
      productId: input.productId,
      slot: parsedSlot.data,
      altText: input.altText,
      blob: {
        pathname: input.pathname,
        url: input.url,
        contentType: input.contentType,
      },
      originalFilename: input.originalFilename,
      byteSize: input.byteSize,
      width: input.width,
      height: input.height,
      normalized: input.normalized,
    });

    await revalidateForProduct(input.productId);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProductMediaMutationError) {
      return { error: error.message };
    }

    return { error: MEDIA_ERRORS.GENERIC };
  }
}

export async function deletePrimaryImageAction(
  productId: string,
): Promise<MediaActionState> {
  await requireAdmin();

  if (!Types.ObjectId.isValid(productId)) {
    return invalidProductState();
  }

  const storageKey = await deletePrimaryImage(productId);
  if (!storageKey) {
    return { error: MEDIA_ERRORS.MEDIA_NOT_FOUND };
  }

  await deleteOldBlobBestEffort(storageKey);
  await revalidateForProduct(productId);
  return { success: true };
}

export async function deleteGalleryImageAction(
  productId: string,
  mediaItemId: string,
): Promise<MediaActionState> {
  await requireAdmin();

  if (!Types.ObjectId.isValid(productId)) {
    return invalidProductState();
  }

  const storageKey = await deleteGalleryImage(productId, mediaItemId);
  if (!storageKey) {
    return { error: MEDIA_ERRORS.MEDIA_NOT_FOUND };
  }

  await deleteOldBlobBestEffort(storageKey);
  await revalidateForProduct(productId);
  return { success: true };
}

export async function deleteRecolorMaskAction(
  productId: string,
): Promise<MediaActionState> {
  await requireAdmin();

  if (!Types.ObjectId.isValid(productId)) {
    return invalidProductState();
  }

  const storageKey = await deleteRecolorMask(productId);
  if (!storageKey) {
    return { error: MEDIA_ERRORS.MEDIA_NOT_FOUND };
  }

  await deleteOldBlobBestEffort(storageKey);
  await revalidateForProduct(productId);
  return { success: true };
}

export async function setRecolorEnabledAction(
  productId: string,
  enabled: boolean,
): Promise<MediaActionState> {
  await requireAdmin();

  if (!Types.ObjectId.isValid(productId)) {
    return invalidProductState();
  }

  try {
    const updated = await setRecolorEnabled(productId, enabled);
    if (!updated) {
      return { error: MEDIA_ERRORS.INVALID_PRODUCT };
    }

    await revalidateForProduct(productId);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProductMediaMutationError) {
      return { error: error.message };
    }

    return { error: MEDIA_ERRORS.GENERIC };
  }
}

export async function deleteTechnicalDrawingAction(
  productId: string,
): Promise<MediaActionState> {
  await requireAdmin();

  if (!Types.ObjectId.isValid(productId)) {
    return invalidProductState();
  }

  const storageKey = await deleteTechnicalDrawing(productId);
  if (!storageKey) {
    return { error: MEDIA_ERRORS.MEDIA_NOT_FOUND };
  }

  await deleteOldBlobBestEffort(storageKey);
  await revalidateForProduct(productId);
  return { success: true };
}

export async function moveGalleryImageAction(
  productId: string,
  mediaItemId: string,
  direction: "up" | "down",
): Promise<MediaActionState> {
  await requireAdmin();

  if (!Types.ObjectId.isValid(productId)) {
    return invalidProductState();
  }

  const moved = await moveGalleryImage(productId, mediaItemId, direction);
  if (!moved) {
    return { error: MEDIA_ERRORS.MEDIA_NOT_FOUND };
  }

  await revalidateForProduct(productId);
  return { success: true };
}

export async function updatePrimaryAltTextAction(
  productId: string,
  altText: string,
): Promise<MediaActionState> {
  await requireAdmin();

  if (!Types.ObjectId.isValid(productId)) {
    return invalidProductState();
  }

  const updated = await updatePrimaryAltText(productId, altText);
  if (!updated) {
    return { error: MEDIA_ERRORS.MEDIA_NOT_FOUND };
  }

  await revalidateForProduct(productId);
  return { success: true };
}

export async function updateGalleryAltTextAction(
  productId: string,
  mediaItemId: string,
  altText: string,
): Promise<MediaActionState> {
  await requireAdmin();

  if (!Types.ObjectId.isValid(productId)) {
    return invalidProductState();
  }

  const updated = await updateGalleryAltText(productId, mediaItemId, altText);
  if (!updated) {
    return { error: MEDIA_ERRORS.MEDIA_NOT_FOUND };
  }

  await revalidateForProduct(productId);
  return { success: true };
}

export async function updateTechnicalAltTextAction(
  productId: string,
  altText: string,
): Promise<MediaActionState> {
  await requireAdmin();

  if (!Types.ObjectId.isValid(productId)) {
    return invalidProductState();
  }

  const updated = await updateTechnicalAltText(productId, altText);
  if (!updated) {
    return { error: MEDIA_ERRORS.MEDIA_NOT_FOUND };
  }

  await revalidateForProduct(productId);
  return { success: true };
}

export async function getAdminProductMediaAction(productId: string) {
  await requireAdmin();
  return getAdminProductMediaById(productId);
}

export type ProductImageTrimPreviewResult =
  | { error: string }
  | {
      previewBase64: string;
      mimeType: string;
      width: number;
      height: number;
      trimmed: boolean;
      skipped: boolean;
      reason: string;
      sourceWidth: number;
      sourceHeight: number;
      contentBounds?: ContentBounds;
      suggestedFilename: string;
    };

function extensionForMimeType(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return ".jpg";
  }
}

export async function previewProductImageTrimAction(
  formData: FormData,
): Promise<ProductImageTrimPreviewResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: MEDIA_ERRORS.INVALID_PAYLOAD };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await trimProductImageBuffer(buffer);

  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  const suggestedFilename = `${baseName}${extensionForMimeType(result.mimeType)}`;

  return {
    previewBase64: result.buffer.toString("base64"),
    mimeType: result.mimeType,
    width: result.width,
    height: result.height,
    trimmed: result.trimmed,
    skipped: result.skipped,
    reason: result.reason,
    sourceWidth: result.sourceWidth,
    sourceHeight: result.sourceHeight,
    contentBounds: result.contentBounds,
    suggestedFilename,
  };
}
