import { upload } from "@vercel/blob/client";
import {
  finalizeMediaUploadAction,
  prepareMediaUploadAction,
} from "@/app/admin/products/media-actions";
import { validateMaskDimensionsAgainstPrimary } from "@/lib/recolor/load-image-dimensions";
import { validateFileForSlotClient } from "@/lib/media/media-validation";

export async function uploadRecolorMaskFile(
  productId: string,
  file: File,
  primaryImageUrl: string,
): Promise<{ error?: string }> {
  const clientValidation = validateFileForSlotClient(file, "recolor-mask");
  if (!clientValidation.ok) {
    return { error: clientValidation.message };
  }

  const dimensionValidation = await validateMaskDimensionsAgainstPrimary(
    file,
    primaryImageUrl,
  );
  if (!dimensionValidation.ok) {
    return { error: dimensionValidation.message };
  }

  const prepared = await prepareMediaUploadAction(
    productId,
    "recolor-mask",
    file.name,
  );

  if ("error" in prepared) {
    return { error: prepared.error };
  }

  const blob = await upload(prepared.pathname, file, {
    access: "public",
    handleUploadUrl: `/api/admin/products/${productId}/media/upload`,
    clientPayload: prepared.clientPayload,
    contentType: file.type,
  });

  const result = await finalizeMediaUploadAction({
    productId,
    slot: "recolor-mask",
    pathname: blob.pathname,
    url: blob.url,
    contentType: file.type,
    originalFilename: file.name,
    byteSize: file.size,
  });

  if (result.error) {
    return { error: result.error };
  }

  return {};
}
