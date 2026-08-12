import { Types } from "mongoose";
import {
  getGalleryCount,
  getProductSlug,
  productExists,
} from "@/lib/media/getAdminProductMediaById";
import {
  isPathnameInSlotNamespace,
} from "@/lib/media/build-storage-path";
import {
  GALLERY_MAX_COUNT,
  MEDIA_ERRORS,
  getAllowedMimeTypesForSlot,
  getMaxBytesForSlot,
  parseMediaUploadClientPayload,
} from "@/lib/media/media-validation";
import {
  assertAdminForUpload,
  MediaUploadAuthorizationError,
} from "@/lib/media/require-admin-for-api";
import type { MediaUploadTokenPayload } from "@/types/admin-product-media";

export type UploadTokenConfig = {
  allowedContentTypes: string[];
  maximumSizeInBytes: number;
  addRandomSuffix: false;
  tokenPayload: string;
  callbackUrl: string;
};

export async function validateUploadTokenRequest(
  productId: string,
  pathname: string,
  clientPayload: string | null,
  callbackUrl: string,
): Promise<UploadTokenConfig> {
  await assertAdminForUpload();

  if (!Types.ObjectId.isValid(productId)) {
    throw new MediaUploadAuthorizationError(
      MEDIA_ERRORS.INVALID_PRODUCT,
      400,
    );
  }

  const payload = parseMediaUploadClientPayload(clientPayload);
  if (!payload) {
    throw new MediaUploadAuthorizationError(MEDIA_ERRORS.INVALID_PAYLOAD, 400);
  }

  const exists = await productExists(productId);
  if (!exists) {
    throw new MediaUploadAuthorizationError(MEDIA_ERRORS.INVALID_PRODUCT, 404);
  }

  if (!isPathnameInSlotNamespace(pathname, productId, payload.slot)) {
    throw new MediaUploadAuthorizationError(MEDIA_ERRORS.INVALID_PATHNAME, 400);
  }

  if (payload.slot === "gallery") {
    const count = await getGalleryCount(productId);
    if (count >= GALLERY_MAX_COUNT) {
      throw new MediaUploadAuthorizationError(MEDIA_ERRORS.GALLERY_FULL, 400);
    }
  }

  const tokenPayload: MediaUploadTokenPayload = {
    productId,
    slot: payload.slot,
    altText: payload.altText,
  };

  return {
    allowedContentTypes: [...getAllowedMimeTypesForSlot(payload.slot)],
    maximumSizeInBytes: getMaxBytesForSlot(payload.slot),
    addRandomSuffix: false,
    tokenPayload: JSON.stringify(tokenPayload),
    callbackUrl,
  };
}

export async function getProductSlugForRevalidation(
  productId: string,
): Promise<string | null> {
  return getProductSlug(productId);
}
