import { describe, expect, it } from "vitest";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  GALLERY_MAX_COUNT,
  MEDIA_SIZE_LIMITS,
  getMaxBytesForSlot,
  parseMediaUploadClientPayload,
  validateFileForSlotClient,
} from "@/lib/media/media-validation";

describe("media-validation", () => {
  it("allows jpeg/png/webp mime types only", () => {
    expect(ALLOWED_IMAGE_MIME_TYPES).toEqual([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);
  });

  it("enforces slot size limits", () => {
    expect(getMaxBytesForSlot("primary")).toBe(MEDIA_SIZE_LIMITS.primary);
    expect(getMaxBytesForSlot("technical")).toBe(MEDIA_SIZE_LIMITS.technical);
  });

  it("parses valid client payload", () => {
    const payload = parseMediaUploadClientPayload(
      JSON.stringify({ slot: "gallery", altText: "תמונה" }),
    );
    expect(payload).toEqual({ slot: "gallery", altText: "תמונה" });
  });

  it("rejects invalid client payload", () => {
    expect(parseMediaUploadClientPayload(JSON.stringify({ slot: "video" }))).toBe(
      null,
    );
  });

  it("validates client file size for gallery", () => {
    const file = {
      type: "image/jpeg",
      size: MEDIA_SIZE_LIMITS.gallery + 1,
    } as File;

    expect(validateFileForSlotClient(file, "gallery").ok).toBe(false);
  });

  it("caps gallery at eight images", () => {
    expect(GALLERY_MAX_COUNT).toBe(8);
  });
});
