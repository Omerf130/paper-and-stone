import { describe, expect, it, vi, beforeEach } from "vitest";

const createMock = vi.fn();
const updateOneMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Category", () => ({
  default: {
    create: createMock,
    updateOne: updateOneMock,
  },
}));

describe("category mutations", () => {
  beforeEach(() => {
    createMock.mockReset();
    updateOneMock.mockReset();
  });

  it("maps duplicate slug errors on create", async () => {
    createMock.mockRejectedValue({
      code: 11000,
      keyPattern: { slug: 1 },
    });

    const { createCategory, CategoryMutationError } = await import(
      "@/lib/categories/category-mutations"
    );
    const { CATEGORY_ERRORS } = await import(
      "@/lib/categories/category-validation"
    );

    await expect(
      createCategory({
        nameHe: "ספות",
        slug: "sofas",
        sortOrder: 0,
        isActive: true,
      }),
    ).rejects.toMatchObject({
      message: CATEGORY_ERRORS.DUPLICATE_SLUG,
    });

    expect(CategoryMutationError).toBeDefined();
  });

  it("maps duplicate slug errors on update", async () => {
    updateOneMock.mockRejectedValue({
      code: 11000,
      keyPattern: { slug: 1 },
    });

    const { updateCategory } = await import(
      "@/lib/categories/category-mutations"
    );
    const { CATEGORY_ERRORS } = await import(
      "@/lib/categories/category-validation"
    );

    await expect(
      updateCategory("507f1f77bcf86cd799439011", {
        nameHe: "ספות",
        slug: "sofas",
        sortOrder: 0,
        isActive: true,
      }),
    ).rejects.toMatchObject({
      message: CATEGORY_ERRORS.DUPLICATE_SLUG,
    });
  });
});
