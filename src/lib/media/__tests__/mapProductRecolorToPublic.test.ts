import { describe, expect, it } from "vitest";
import { mapProductRecolorToPublic } from "@/lib/media/mapProductRecolorToPublic";
import { Types } from "mongoose";

describe("mapProductRecolorToPublic", () => {
  const primaryId = new Types.ObjectId();

  it("returns null when recolor is disabled", () => {
    const result = mapProductRecolorToPublic({
      nameHe: "ספת Milano",
      media: {
        primaryImage: {
          _id: primaryId,
          storageKey: "products/1/primary/a.jpg",
          url: "https://example.com/a.jpg",
          mediaType: "PRODUCT_IMAGE",
          mimeType: "image/jpeg",
          originalFilename: "a.jpg",
          byteSize: 100,
          sortOrder: 0,
          createdAt: new Date(),
        },
        gallery: [],
        recolorMask: {
          _id: new Types.ObjectId(),
          storageKey: "products/1/recolor-mask/m.png",
          url: "https://example.com/m.png",
          mediaType: "RECOLOR_MASK",
          mimeType: "image/png",
          originalFilename: "m.png",
          byteSize: 50,
          sortOrder: 0,
          createdAt: new Date(),
        },
      },
      recolorConfig: {
        enabled: false,
        status: "ready",
        sourceImageMediaId: primaryId,
      },
    });

    expect(result).toBeNull();
  });

  it("exposes public recolor fields without storageKey", () => {
    const result = mapProductRecolorToPublic({
      nameHe: "ספת Milano",
      media: {
        primaryImage: {
          _id: primaryId,
          storageKey: "secret/primary.jpg",
          url: "https://example.com/a.jpg",
          mediaType: "PRODUCT_IMAGE",
          mimeType: "image/jpeg",
          originalFilename: "a.jpg",
          byteSize: 100,
          sortOrder: 0,
          createdAt: new Date(),
        },
        gallery: [],
        recolorMask: {
          _id: new Types.ObjectId(),
          storageKey: "secret/mask.png",
          url: "https://example.com/m.png",
          mediaType: "RECOLOR_MASK",
          mimeType: "image/png",
          originalFilename: "m.png",
          byteSize: 50,
          sortOrder: 0,
          createdAt: new Date(),
        },
      },
      recolorConfig: {
        enabled: true,
        status: "ready",
        sourceImageMediaId: primaryId,
      },
    });

    expect(result).toEqual({
      enabled: true,
      sourceImage: {
        url: "https://example.com/a.jpg",
        alt: "ספת Milano",
      },
      mask: {
        url: "https://example.com/m.png",
      },
    });
    expect(result).not.toHaveProperty("storageKey");
  });

  it("returns null when source image binding is invalid", () => {
    const result = mapProductRecolorToPublic({
      nameHe: "ספת Milano",
      media: {
        primaryImage: {
          _id: primaryId,
          storageKey: "secret/primary.jpg",
          url: "https://example.com/a.jpg",
          mediaType: "PRODUCT_IMAGE",
          mimeType: "image/jpeg",
          originalFilename: "a.jpg",
          byteSize: 100,
          sortOrder: 0,
          createdAt: new Date(),
        },
        gallery: [],
        recolorMask: {
          _id: new Types.ObjectId(),
          storageKey: "secret/mask.png",
          url: "https://example.com/m.png",
          mediaType: "RECOLOR_MASK",
          mimeType: "image/png",
          originalFilename: "m.png",
          byteSize: 50,
          sortOrder: 0,
          createdAt: new Date(),
        },
      },
      recolorConfig: {
        enabled: true,
        status: "invalid_source",
        sourceImageMediaId: new Types.ObjectId(),
      },
    });

    expect(result).toBeNull();
  });
});
