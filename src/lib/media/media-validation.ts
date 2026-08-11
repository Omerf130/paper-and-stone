import type { MediaSlot } from "@/types/admin-product-media";
import { z } from "zod";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const GALLERY_MAX_COUNT = 8;

export const MEDIA_SIZE_LIMITS = {
  primary: 5 * 1024 * 1024,
  gallery: 5 * 1024 * 1024,
  technical: 10 * 1024 * 1024,
} as const;

export const MEDIA_ERRORS = {
  UNAUTHORIZED: "אין הרשאה לבצע פעולה זו.",
  INVALID_PRODUCT: "מוצר לא נמצא.",
  INVALID_SLOT: "סוג מדיה לא תקין.",
  INVALID_PAYLOAD: "בקשת העלאה לא תקינה.",
  INVALID_PATHNAME: "נתיב אחסון לא תקין.",
  GALLERY_FULL: "ניתן להוסיף עד 8 תמונות לגלריה.",
  MIME_NOT_ALLOWED:
    "סוג קובץ לא נתמך. ניתן להעלות קבצי JPEG, PNG או WebP בלבד.",
  FILE_TOO_LARGE_PRIMARY: "גודל התמונה הראשית חייב להיות עד 5 MB.",
  FILE_TOO_LARGE_GALLERY: "גודל כל תמונת גלריה חייב להיות עד 5 MB.",
  FILE_TOO_LARGE_TECHNICAL: "גודל שרטוט טכני חייב להיות עד 10 MB.",
  MEDIA_NOT_FOUND: "פריט המדיה לא נמצא.",
  GENERIC: "אירעה שגיאה. נסו שוב.",
} as const;

export const mediaSlotSchema = z.enum(["primary", "gallery", "technical"]);

export const mediaUploadClientPayloadSchema = z.object({
  slot: mediaSlotSchema,
  altText: z.string().max(500).optional(),
});

export function getMaxBytesForSlot(slot: MediaSlot): number {
  return MEDIA_SIZE_LIMITS[slot];
}

export function getFileTooLargeMessage(slot: MediaSlot): string {
  switch (slot) {
    case "primary":
      return MEDIA_ERRORS.FILE_TOO_LARGE_PRIMARY;
    case "gallery":
      return MEDIA_ERRORS.FILE_TOO_LARGE_GALLERY;
    case "technical":
      return MEDIA_ERRORS.FILE_TOO_LARGE_TECHNICAL;
  }
}

export function parseMediaUploadClientPayload(
  raw: string | null,
): z.infer<typeof mediaUploadClientPayloadSchema> | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    const result = mediaUploadClientPayloadSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export type ClientFileValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validateFileForSlotClient(
  file: File,
  slot: MediaSlot,
): ClientFileValidationResult {
  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      file.type as AllowedImageMimeType,
    )
  ) {
    return { ok: false, message: MEDIA_ERRORS.MIME_NOT_ALLOWED };
  }

  if (file.size > getMaxBytesForSlot(slot)) {
    return { ok: false, message: getFileTooLargeMessage(slot) };
  }

  return { ok: true };
}

export function getMediaTypeForSlot(
  slot: MediaSlot,
): "PRODUCT_IMAGE" | "TECHNICAL_DRAWING" {
  return slot === "technical" ? "TECHNICAL_DRAWING" : "PRODUCT_IMAGE";
}
