import { assertAdminForUpload } from "@/lib/media/require-admin-for-api";
import type { UploadTokenConfig } from "@/lib/media/upload-token-validation";
import {
  CMS_MEDIA_ERRORS,
  getAllowedCmsMimeTypes,
  getMaxBytesForCmsImage,
  parseCmsMediaUploadClientPayload,
} from "@/lib/cms/cms-media-validation";
import { isPathnameInCmsScope } from "@/lib/cms/build-cms-storage-path";

export type CmsMediaUploadTokenPayload = {
  mediaScope: string;
  alt?: string;
  itemId?: string;
};

export async function validateCmsUploadTokenRequest(
  pathname: string,
  clientPayload: string | null | undefined,
  callbackUrl: string,
): Promise<UploadTokenConfig> {
  await assertAdminForUpload();

  const parsedPayload = parseCmsMediaUploadClientPayload(clientPayload);
  if (!parsedPayload.success) {
    throw new Error(parsedPayload.error);
  }

  const { mediaScope, alt, itemId } = parsedPayload.data;

  if (!isPathnameInCmsScope(pathname, mediaScope, { itemId })) {
    throw new Error(CMS_MEDIA_ERRORS.INVALID_PATHNAME);
  }

  const tokenPayload: CmsMediaUploadTokenPayload = {
    mediaScope,
    alt: alt?.trim() || undefined,
    itemId,
  };

  return {
    allowedContentTypes: getAllowedCmsMimeTypes(),
    maximumSizeInBytes: getMaxBytesForCmsImage(),
    addRandomSuffix: false,
    tokenPayload: JSON.stringify(tokenPayload),
    callbackUrl,
  };
}
