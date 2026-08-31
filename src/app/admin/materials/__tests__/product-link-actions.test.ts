import { describe, expect, it, vi, beforeEach } from "vitest";

const linkMock = vi.fn();
const unlinkMock = vi.fn();
const getUnlinkedMock = vi.fn();

vi.mock("@/lib/auth/authorization", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/materials/material-product-links", () => ({
  getProductsUsingMaterial: vi.fn(),
  getUnlinkedProductsForMaterial: getUnlinkedMock,
  linkMaterialToProduct: linkMock,
  unlinkMaterialFromProduct: unlinkMock,
}));

describe("material product-link actions", () => {
  beforeEach(() => {
    linkMock.mockReset();
    unlinkMock.mockReset();
    getUnlinkedMock.mockReset();
    linkMock.mockResolvedValue({ ok: true });
    unlinkMock.mockResolvedValue({ ok: true });
    getUnlinkedMock.mockResolvedValue([]);
  });

  it("requires admin before linking", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    const { linkMaterialProductAction } = await import(
      "@/app/admin/materials/product-link-actions"
    );

    await linkMaterialProductAction(
      "507f1f77bcf86cd799439012",
      "507f1f77bcf86cd799439011",
      ["507f1f77bcf86cd799439013"],
    );

    expect(requireAdmin).toHaveBeenCalled();
    expect(linkMock).toHaveBeenCalled();
  });

  it("requires admin before unlinking", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    const { unlinkMaterialProductAction } = await import(
      "@/app/admin/materials/product-link-actions"
    );

    await unlinkMaterialProductAction(
      "507f1f77bcf86cd799439012",
      "507f1f77bcf86cd799439011",
    );

    expect(requireAdmin).toHaveBeenCalled();
    expect(unlinkMock).toHaveBeenCalled();
  });

  it("passes search query to unlinked product lookup", async () => {
    const { fetchUnlinkedProductsAction } = await import(
      "@/app/admin/materials/product-link-actions"
    );

    await fetchUnlinkedProductsAction("507f1f77bcf86cd799439012", "chair");

    expect(getUnlinkedMock).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439012",
      "chair",
    );
  });
});
