import { z } from "zod";
import {
  cmsMediaScopeRequiresItemId,
  isKnownCmsMediaScope,
  isWritableCmsMediaScope,
} from "@/lib/cms/cms-media-scope";

export const CMS_ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const CMS_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const CMS_MEDIA_ERRORS = {
  UNAUTHORIZED: "אין הרשאה לבצע פעולה זו.",
  INVALID_SCOPE: "שדה מדיה לא תקין.",
  INVALID_PAYLOAD: "בקשת העלאה לא תקינה.",
  INVALID_PATHNAME: "נתיב אחסון לא תקין.",
  MIME_NOT_ALLOWED: "סוג קובץ לא נתמך. ניתן להעלות קבצי JPEG, PNG או WebP בלבד.",
  FILE_TOO_LARGE: "גודל התמונה חייב להיות עד 5 MB.",
  GENERIC: "אירעה שגיאה. נסו שוב.",
} as const;

export const cmsMediaUploadClientPayloadSchema = z.object({
  mediaScope: z.string().min(1),
  alt: z.string().max(500).optional(),
  itemId: z.string().uuid().optional(),
});

export type CmsMediaUploadClientPayload = z.infer<
  typeof cmsMediaUploadClientPayloadSchema
>;

export function getAllowedCmsMimeTypes(): string[] {
  return [...CMS_ALLOWED_IMAGE_MIME_TYPES];
}

export function getMaxBytesForCmsImage(): number {
  return CMS_IMAGE_MAX_BYTES;
}

export function validateCmsImageFileClient(file: File):
  | { ok: true }
  | { ok: false; message: string } {
  if (
    !CMS_ALLOWED_IMAGE_MIME_TYPES.includes(
      file.type as (typeof CMS_ALLOWED_IMAGE_MIME_TYPES)[number],
    )
  ) {
    return { ok: false, message: CMS_MEDIA_ERRORS.MIME_NOT_ALLOWED };
  }

  if (file.size > CMS_IMAGE_MAX_BYTES) {
    return { ok: false, message: CMS_MEDIA_ERRORS.FILE_TOO_LARGE };
  }

  return { ok: true };
}

export function parseCmsMediaUploadClientPayload(
  raw: string | null | undefined,
):
  | { success: true; data: CmsMediaUploadClientPayload }
  | { success: false; error: string } {
  if (!raw) {
    return { success: false, error: CMS_MEDIA_ERRORS.INVALID_PAYLOAD };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return { success: false, error: CMS_MEDIA_ERRORS.INVALID_PAYLOAD };
  }

  const parsed = cmsMediaUploadClientPayloadSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return { success: false, error: CMS_MEDIA_ERRORS.INVALID_PAYLOAD };
  }

  if (!isKnownCmsMediaScope(parsed.data.mediaScope)) {
    return { success: false, error: CMS_MEDIA_ERRORS.INVALID_SCOPE };
  }

  if (!isWritableCmsMediaScope(parsed.data.mediaScope)) {
    return { success: false, error: CMS_MEDIA_ERRORS.INVALID_SCOPE };
  }

  if (
    cmsMediaScopeRequiresItemId(parsed.data.mediaScope) &&
    !parsed.data.itemId
  ) {
    return { success: false, error: CMS_MEDIA_ERRORS.INVALID_PAYLOAD };
  }

  return { success: true, data: parsed.data };
}
