import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/authorization", () => ({
  requireAdmin: vi.fn(() => {
    throw new Error("redirect");
  }),
}));

vi.mock("@/lib/media/getAdminProductMediaById", () => ({
  productExists: vi.fn(),
  getGalleryCount: vi.fn(),
  getProductSlug: vi.fn(),
  getAdminProductMediaById: vi.fn(),
}));

vi.mock("@/lib/media/product-media-mutations", () => ({
  applyUploadIdempotent: vi.fn(),
  deleteGalleryImage: vi.fn(),
  deleteOldBlobBestEffort: vi.fn(),
  deletePrimaryImage: vi.fn(),
  deleteTechnicalDrawing: vi.fn(),
  moveGalleryImage: vi.fn(),
  updateGalleryAltText: vi.fn(),
  updatePrimaryAltText: vi.fn(),
  updateTechnicalAltText: vi.fn(),
}));

vi.mock("@/lib/media/revalidate-product-media-paths", () => ({
  revalidateProductMediaPaths: vi.fn(),
}));

describe("media-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires admin before prepare upload", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    const { prepareMediaUploadAction } = await import(
      "@/app/admin/products/media-actions"
    );

    await expect(
      prepareMediaUploadAction("507f1f77bcf86cd799439011", "primary", "a.jpg"),
    ).rejects.toThrow();

    expect(requireAdmin).toHaveBeenCalled();
  });

  it("requires admin before delete primary", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    vi.mocked(requireAdmin).mockImplementationOnce(async () => ({
      id: "admin",
      email: "admin@test.com",
      role: "admin" as const,
    }));
    const { deletePrimaryImage } = await import(
      "@/lib/media/product-media-mutations"
    );
    const { deletePrimaryImageAction } = await import(
      "@/app/admin/products/media-actions"
    );

    vi.mocked(deletePrimaryImage).mockResolvedValue("storage-key");

    await deletePrimaryImageAction("507f1f77bcf86cd799439011");

    expect(requireAdmin).toHaveBeenCalled();
  });
});
