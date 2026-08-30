import { describe, expect, it } from "vitest";
import { shouldShowRecolorForImage } from "@/lib/recolor/recolor-configurator-helpers";
import type { ProductView } from "@/types/product";

const baseProduct: ProductView = {
  slug: "demo",
  name: "Demo",
  nameHe: "דמו",
  brand: "",
  designer: "",
  sku: "SKU-1",
  category: "ספות",
  shortDescription: "",
  longDescription: "",
  dimensions: {},
  materials: [],
  maintenance: "",
  warranty: "",
  countryOfOrigin: "",
  materialOptions: [],
  sizes: [],
  primaryImage: {
    url: "https://example.com/primary.jpg",
    alt: "דמו",
  },
  gallery: [
    {
      url: "https://example.com/gallery.jpg",
      alt: "גלריה",
    },
  ],
  technicalDrawing: null,
  recolor: {
    enabled: true,
    sourceImage: {
      url: "https://example.com/primary.jpg",
      alt: "דמו",
    },
    mask: {
      url: "https://example.com/mask.png",
    },
  },
  documents: [],
};

describe("shouldShowRecolorForImage", () => {
  it("shows recolor only for the configured source image", () => {
    expect(
      shouldShowRecolorForImage(
        baseProduct,
        "https://example.com/primary.jpg",
        "#FF0000",
      ),
    ).toBe(true);

    expect(
      shouldShowRecolorForImage(
        baseProduct,
        "https://example.com/gallery.jpg",
        "#FF0000",
      ),
    ).toBe(false);
  });

  it("requires a selected color hex", () => {
    expect(
      shouldShowRecolorForImage(
        baseProduct,
        "https://example.com/primary.jpg",
        null,
      ),
    ).toBe(false);
  });
});
