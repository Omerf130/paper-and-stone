import { describe, expect, it } from "vitest";
import {
  mapGalleryToPublic,
  mapMediaItemToPublicImage,
  mapPrimaryImageToPublic,
  mapTechnicalDrawingToPublic,
} from "@/lib/media/mapProductMediaToPublic";
import { mapProductToCatalogView } from "@/lib/products/mapProductToCatalogView";
import { mapProductToView } from "@/lib/products/mapProductToView";

const mediaItem = {
  storageKey: "products/demo/primary.jpg",
  url: "https://example.blob.vercel-storage.com/primary.jpg",
  altText: "ספת Milano",
  width: 1200,
  height: 900,
  sortOrder: 0,
};

describe("mapProductMediaToPublic", () => {
  it("maps public image fields only", () => {
    expect(mapMediaItemToPublicImage(mediaItem, "fallback")).toEqual({
      url: mediaItem.url,
      alt: "ספת Milano",
      width: 1200,
      height: 900,
    });
  });

  it("returns null when url is missing", () => {
    expect(mapMediaItemToPublicImage(undefined, "fallback")).toBeNull();
  });

  it("uses fallback alt text when altText is empty", () => {
    const image = mapMediaItemToPublicImage(
      { ...mediaItem, altText: "   " },
      "שם מוצר",
    );

    expect(image?.alt).toBe("שם מוצר");
  });

  it("sorts gallery by sortOrder", () => {
    const gallery = mapGalleryToPublic(
      [
        {
          ...mediaItem,
          url: "https://example.blob.vercel-storage.com/2.jpg",
          sortOrder: 2,
        },
        {
          ...mediaItem,
          url: "https://example.blob.vercel-storage.com/1.jpg",
          sortOrder: 1,
        },
      ],
      "fallback",
    );

    expect(gallery.map((item) => item.url)).toEqual([
      "https://example.blob.vercel-storage.com/1.jpg",
      "https://example.blob.vercel-storage.com/2.jpg",
    ]);
  });

  it("does not expose storageKey in public image views", () => {
    const primary = mapPrimaryImageToPublic(mediaItem, "fallback");
    const technical = mapTechnicalDrawingToPublic(mediaItem, "fallback");

    expect(primary).not.toHaveProperty("storageKey");
    expect(technical).not.toHaveProperty("storageKey");
  });
});

describe("product media fallbacks", () => {
  it("maps empty media to null/empty public fields", () => {
    const view = mapProductToView({
      slug: "demo",
      nameHe: "דמו",
      categoryId: { nameHe: "ספות" },
    } as never);

    expect(view.primaryImage).toBeNull();
    expect(view.gallery).toEqual([]);
    expect(view.technicalDrawing).toBeNull();
  });

  it("serializes catalog primary image only", () => {
    const catalogView = mapProductToCatalogView({
      slug: "demo",
      nameHe: "דמו",
      categoryId: { nameHe: "ספות" },
      media: {
        primaryImage: mediaItem,
        gallery: [
          {
            ...mediaItem,
            url: "https://example.blob.vercel-storage.com/gallery.jpg",
          },
        ],
      },
    } as never);

    expect(catalogView.primaryImage?.url).toBe(mediaItem.url);
    expect(catalogView).not.toHaveProperty("gallery");
    expect(catalogView.primaryImage).not.toHaveProperty("storageKey");
  });
});
