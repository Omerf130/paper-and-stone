import { describe, expect, it, vi, beforeEach } from "vitest";

const createMock = vi.fn();
const updateOneMock = vi.fn();

vi.mock("@/lib/auth/authorization", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/products/product-mutations", () => ({
  createProduct: createMock,
  updateProduct: updateOneMock,
  mapProductInputToWriteFields: vi.fn((input) => input),
  ProductMutationError: class ProductMutationError extends Error {},
}));

vi.mock("@/lib/products/product-validation", () => ({
  parseProductFormInput: vi.fn(() => ({
    success: true,
    data: { nameHe: "test" },
  })),
  PRODUCT_ERRORS: {
    GENERIC: "generic",
  },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("redirect");
  }),
}));

describe("admin product actions", () => {
  beforeEach(() => {
    createMock.mockReset();
    updateOneMock.mockReset();
    createMock.mockResolvedValue("product-id");
  });

  it("requires admin before create", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    const { createProductAction } = await import("@/app/admin/products/actions");

    await expect(
      createProductAction({
        nameHe: "test",
      } as never),
    ).rejects.toThrow("redirect");

    expect(requireAdmin).toHaveBeenCalled();
  });

  it("requires admin before update", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    const { updateProductAction } = await import("@/app/admin/products/actions");

    await updateProductAction("product-id", {
      nameHe: "test",
    } as never);

    expect(requireAdmin).toHaveBeenCalled();
    expect(updateOneMock).toHaveBeenCalled();
  });
});
