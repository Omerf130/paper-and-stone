import { describe, expect, it, vi, beforeEach } from "vitest";

const productFindMock = vi.fn();
const productFindByIdMock = vi.fn();
const productUpdateOneMock = vi.fn();
const verifyMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Category", () => ({
  default: {},
}));

vi.mock("@/models/Product", () => ({
  default: {
    find: (...args: unknown[]) => productFindMock(...args),
    findById: (...args: unknown[]) => productFindByIdMock(...args),
    updateOne: (...args: unknown[]) => productUpdateOneMock(...args),
  },
}));

vi.mock("@/lib/products/material-options/verifyProductMaterialOptions", () => ({
  verifyProductMaterialOptions: (...args: unknown[]) => verifyMock(...args),
}));

describe("material-product-links", () => {
  beforeEach(() => {
    productFindMock.mockReset();
    productFindByIdMock.mockReset();
    productUpdateOneMock.mockReset();
    verifyMock.mockReset();
    verifyMock.mockResolvedValue({ ok: true, materialOptions: [] });
    productUpdateOneMock.mockResolvedValue({ matchedCount: 1 });
  });

  it("maps linked products with display fields", async () => {
    const leanMock = vi.fn().mockResolvedValue([
      {
        _id: "507f1f77bcf86cd799439011",
        nameHe: "כיסא",
        sku: "CHAIR-1",
        isActive: true,
        categoryId: { nameHe: "ריהוט" },
        materialOptions: [
          {
            materialId: "507f1f77bcf86cd799439012",
            allowedColorIds: ["507f1f77bcf86cd799439013"],
          },
        ],
        media: { primaryImage: { url: "https://example.com/a.jpg" } },
      },
    ]);

    productFindMock.mockReturnValue({
      populate: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            lean: leanMock,
          }),
        }),
      }),
    });

    const { getProductsUsingMaterial } = await import(
      "@/lib/materials/material-product-links"
    );

    const links = await getProductsUsingMaterial("507f1f77bcf86cd799439012");

    expect(links).toEqual([
      {
        productId: "507f1f77bcf86cd799439011",
        nameHe: "כיסא",
        sku: "CHAIR-1",
        allowedVariantIds: ["507f1f77bcf86cd799439013"],
        categoryName: "ריהוט",
        isActive: true,
        thumbnailUrl: "https://example.com/a.jpg",
      },
    ]);
  });

  it("rejects link without selected variants", async () => {
    const { linkMaterialToProduct } = await import(
      "@/lib/materials/material-product-links"
    );

    const result = await linkMaterialToProduct(
      "507f1f77bcf86cd799439012",
      "507f1f77bcf86cd799439011",
      [],
    );

    expect(result).toEqual({
      ok: false,
      message: "יש לבחור לפחות variant אחד",
    });
    expect(productFindByIdMock).not.toHaveBeenCalled();
  });

  it("links material to product through verifyProductMaterialOptions", async () => {
    productFindByIdMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          materialOptions: [],
        }),
      }),
    });

    const { linkMaterialToProduct } = await import(
      "@/lib/materials/material-product-links"
    );

    const result = await linkMaterialToProduct(
      "507f1f77bcf86cd799439012",
      "507f1f77bcf86cd799439011",
      ["507f1f77bcf86cd799439013"],
    );

    expect(result).toEqual({ ok: true });
    expect(verifyMock).toHaveBeenCalled();
    expect(productUpdateOneMock).toHaveBeenCalled();
  });

  it("unlinks material from product without deleting product", async () => {
    productFindByIdMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          materialOptions: [
            {
              materialId: "507f1f77bcf86cd799439012",
              allowedColorIds: ["507f1f77bcf86cd799439013"],
            },
          ],
        }),
      }),
    });

    const { unlinkMaterialFromProduct } = await import(
      "@/lib/materials/material-product-links"
    );

    const result = await unlinkMaterialFromProduct(
      "507f1f77bcf86cd799439012",
      "507f1f77bcf86cd799439011",
    );

    expect(result).toEqual({ ok: true });
    expect(productUpdateOneMock).toHaveBeenCalledWith(
      { _id: "507f1f77bcf86cd799439011" },
      expect.objectContaining({
        $set: {
          materialOptions: [],
        },
      }),
    );
  });

  it("rejects invalid ids", async () => {
    const { linkMaterialToProduct } = await import(
      "@/lib/materials/material-product-links"
    );

    const result = await linkMaterialToProduct("invalid", "also-invalid", [
      "507f1f77bcf86cd799439013",
    ]);

    expect(result).toEqual({ ok: false, message: "מזהה לא תקין" });
  });
});
