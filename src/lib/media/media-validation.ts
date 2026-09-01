import { z } from "zod";
import type { MediaSlot } from "@/types/admin-product-media";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_MASK_MIME_TYPES = ["image/png"] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];
export type AllowedMaskMimeType = (typeof ALLOWED_MASK_MIME_TYPES)[number];

export const GALLERY_MAX_COUNT = 8;

/** Non-blocking quality warning when the longest image edge is below this size. */
export const SMALL_IMAGE_QUALITY_WARNING_EDGE_PX = 800;

export const MEDIA_SIZE_LIMITS = {
  primary: 5 * 1024 * 1024,
  gallery: 5 * 1024 * 1024,
  technical: 10 * 1024 * 1024,
  "recolor-mask": 5 * 1024 * 1024,
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
  MASK_MIME_NOT_ALLOWED:
    "מסכת צביעה חייבת להיות קובץ PNG בלבד.",
  FILE_TOO_LARGE_PRIMARY: "גודל התמונה הראשית חייב להיות עד 5 MB.",
  FILE_TOO_LARGE_GALLERY: "גודל כל תמונת גלריה חייב להיות עד 5 MB.",
  FILE_TOO_LARGE_TECHNICAL: "גודל שרטוט טכני חייב להיות עד 10 MB.",
  FILE_TOO_LARGE_MASK: "גודל מסכת הצביעה חייב להיות עד 5 MB.",
  MASK_REQUIRES_PRIMARY: "יש להעלות תמונה ראשית לפני העלאת מסכת צביעה.",
  MASK_DIMENSION_MISMATCH:
    "מידות המסכה חייבות להתאים למידות התמונה הראשית (רוחב וגובה).",
  MEDIA_NOT_FOUND: "פריט המדיה לא נמצא.",
  RECOLOR_NOT_READY: "צביעה דינמית אינה מוכנה להפעלה.",
  GENERIC: "אירעה שגיאה. נסו שוב.",
} as const;

export const mediaSlotSchema = z.enum([
  "primary",
  "gallery",
  "technical",
  "recolor-mask",
]);

export const mediaUploadClientPayloadSchema = z.object({
  slot: mediaSlotSchema,
  altText: z.string().max(500).optional(),
});

export function getMaxBytesForSlot(slot: MediaSlot): number {
  return MEDIA_SIZE_LIMITS[slot];
}

export function getAllowedMimeTypesForSlot(slot: MediaSlot): readonly string[] {
  if (slot === "recolor-mask") {
    return ALLOWED_MASK_MIME_TYPES;
  }

  return ALLOWED_IMAGE_MIME_TYPES;
}

export function getFileTooLargeMessage(slot: MediaSlot): string {
  switch (slot) {
    case "primary":
      return MEDIA_ERRORS.FILE_TOO_LARGE_PRIMARY;
    case "gallery":
      return MEDIA_ERRORS.FILE_TOO_LARGE_GALLERY;
    case "technical":
      return MEDIA_ERRORS.FILE_TOO_LARGE_TECHNICAL;
    case "recolor-mask":
      return MEDIA_ERRORS.FILE_TOO_LARGE_MASK;
  }
}

export function getMimeNotAllowedMessage(slot: MediaSlot): string {
  if (slot === "recolor-mask") {
    return MEDIA_ERRORS.MASK_MIME_NOT_ALLOWED;
  }

  return MEDIA_ERRORS.MIME_NOT_ALLOWED;
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
  const allowedTypes = getAllowedMimeTypesForSlot(slot);

  if (!allowedTypes.includes(file.type)) {
    return { ok: false, message: getMimeNotAllowedMessage(slot) };
  }

  if (file.size > getMaxBytesForSlot(slot)) {
    return { ok: false, message: getFileTooLargeMessage(slot) };
  }

  return { ok: true };
}

export function getSmallImageQualityWarning(
  width: number,
  height: number,
): string | null {
  const longestEdge = Math.max(width, height);

  if (longestEdge >= SMALL_IMAGE_QUALITY_WARNING_EDGE_PX) {
    return null;
  }

  return `רזולוציית התמונה (${width}×${height}) נמוכה — התמונה עלולה להיראות באיכות נמוכה בדף המוצר. מומלץ להעלות תמונה בגודל של לפחות ${SMALL_IMAGE_QUALITY_WARNING_EDGE_PX}px בצד הארוך.`;
}

export function getMediaTypeForSlot(
  slot: MediaSlot,
): "PRODUCT_IMAGE" | "TECHNICAL_DRAWING" | "RECOLOR_MASK" {
  if (slot === "technical") {
    return "TECHNICAL_DRAWING";
  }

  if (slot === "recolor-mask") {
    return "RECOLOR_MASK";
  }

  return "PRODUCT_IMAGE";
}
