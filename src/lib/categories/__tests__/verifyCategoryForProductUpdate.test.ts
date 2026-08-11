import { describe, expect, it, vi, beforeEach } from "vitest";

const findByIdProductMock = vi.fn();
const findByIdCategoryMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Product", () => ({
  default: {
    findById: findByIdProductMock,
  },
}));

vi.mock("@/models/Category", () => ({
  default: {
    findById: findByIdCategoryMock,
  },
}));

const productId = "507f1f77bcf86cd799439011";
const categoryId = "507f1f77bcf86cd799439012";
const inactiveCategoryId = "507f1f77bcf86cd799439013";

describe("verifyCategoryForProductUpdate", () => {
  beforeEach(() => {
    findByIdProductMock.mockReset();
    findByIdCategoryMock.mockReset();
  });

  it("allows unchanged inactive category", async () => {
    findByIdProductMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          categoryId: { toString: () => inactiveCategoryId },
        }),
      }),
    });

    findByIdCategoryMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: inactiveCategoryId,
          isActive: false,
        }),
      }),
    });

    const { verifyCategoryForProductUpdate } = await import(
      "@/lib/categories/verifyCategoryForProductUpdate"
    );

    await expect(
      verifyCategoryForProductUpdate(inactiveCategoryId, productId),
    ).resolves.toBeUndefined();
  });

  it("rejects switching to inactive category", async () => {
    findByIdProductMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          categoryId: { toString: () => categoryId },
        }),
      }),
    });

    findByIdCategoryMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: inactiveCategoryId,
          isActive: false,
        }),
      }),
    });

    const { verifyCategoryForProductUpdate } = await import(
      "@/lib/categories/verifyCategoryForProductUpdate"
    );
    const { PRODUCT_ERRORS } = await import(
      "@/lib/products/product-validation"
    );

    await expect(
      verifyCategoryForProductUpdate(inactiveCategoryId, productId),
    ).rejects.toMatchObject({
      message: PRODUCT_ERRORS.INVALID_CATEGORY,
    });
  });

  it("requires changed category to be active", async () => {
    findByIdProductMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          categoryId: { toString: () => categoryId },
        }),
      }),
    });

    findByIdCategoryMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: "507f1f77bcf86cd799439014",
          isActive: true,
        }),
      }),
    });

    const { verifyCategoryForProductUpdate } = await import(
      "@/lib/categories/verifyCategoryForProductUpdate"
    );

    await expect(
      verifyCategoryForProductUpdate("507f1f77bcf86cd799439014", productId),
    ).resolves.toBeUndefined();
  });
});
