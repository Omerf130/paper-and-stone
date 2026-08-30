import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

const save = vi.fn();
const markModified = vi.fn();

vi.mock("@/models/Product", () => ({
  default: {
    findById: vi.fn(),
  },
}));

describe("persistUploadedMedia metadata", () => {
  it("persists normalized media dimensions and flag", async () => {
    const Product = (await import("@/models/Product")).default;
    const product = {
      media: { gallery: [] },
      recolorConfig: { enabled: false, status: "missing_primary" },
      markModified,
      save,
    };

    vi.mocked(Product.findById).mockResolvedValue(product as never);

    const { persistUploadedMedia } = await import(
      "@/lib/media/product-media-mutations"
    );

    await persistUploadedMedia({
      productId: "507f1f77bcf86cd799439011",
      slot: "gallery",
      blob: {
        pathname: "products/507f/gallery/file.jpg",
        url: "https://example.com/file.jpg",
        contentType: "image/jpeg",
      },
      originalFilename: "file.jpg",
      byteSize: 1234,
      width: 900,
      height: 700,
      normalized: true,
    });

    expect(product.media.gallery).toHaveLength(1);
    expect(product.media.gallery[0]).toMatchObject({
      width: 900,
      height: 700,
      normalized: true,
      url: "https://example.com/file.jpg",
    });
    expect(save).toHaveBeenCalled();
  });
});
