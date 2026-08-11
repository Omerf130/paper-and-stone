import { describe, expect, it, vi, beforeEach } from "vitest";

const createMock = vi.fn();
const updateMock = vi.fn();

vi.mock("@/lib/auth/authorization", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/categories/category-mutations", () => ({
  createCategory: createMock,
  updateCategory: updateMock,
  CategoryMutationError: class CategoryMutationError extends Error {},
}));

vi.mock("@/lib/categories/category-validation", () => ({
  parseCategoryFormInput: vi.fn(() => ({
    success: true,
    data: { nameHe: "ספות" },
  })),
  mapCategoryInputToWriteFields: vi.fn((input) => input),
  CATEGORY_ERRORS: {
    GENERIC: "generic",
  },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("redirect");
  }),
}));

describe("admin category actions", () => {
  beforeEach(() => {
    createMock.mockReset();
    updateMock.mockReset();
    createMock.mockResolvedValue("category-id");
  });

  it("requires admin before create", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    const { createCategoryAction } = await import(
      "@/app/admin/categories/actions"
    );

    await expect(
      createCategoryAction({
        nameHe: "ספות",
      } as never),
    ).rejects.toThrow("redirect");

    expect(requireAdmin).toHaveBeenCalled();
  });

  it("requires admin before update", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    const { updateCategoryAction } = await import(
      "@/app/admin/categories/actions"
    );

    await updateCategoryAction("category-id", {
      nameHe: "ספות",
    } as never);

    expect(requireAdmin).toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalled();
  });
});
