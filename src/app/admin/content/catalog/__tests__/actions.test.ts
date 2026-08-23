import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/authorization", () => ({
  requireAdmin: vi.fn(),
}));

const upsertCatalogPageContentMock = vi.fn();
const revalidateCatalogPathsMock = vi.fn();

vi.mock("@/lib/cms/catalog-page-content-mutations", () => ({
  upsertCatalogPageContent: upsertCatalogPageContentMock,
  CatalogPageContentMutationError: class CatalogPageContentMutationError extends Error {},
}));

vi.mock("@/lib/cms/revalidate-catalog-paths", () => ({
  revalidateCatalogPaths: revalidateCatalogPathsMock,
}));

describe("updateCatalogPageContentAction", () => {
  beforeEach(() => {
    upsertCatalogPageContentMock.mockReset();
    revalidateCatalogPathsMock.mockReset();
    upsertCatalogPageContentMock.mockResolvedValue(undefined);
    revalidateCatalogPathsMock.mockResolvedValue(undefined);
  });

  it("requires admin before saving", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    vi.mocked(requireAdmin).mockRejectedValueOnce(new Error("redirect"));

    const { updateCatalogPageContentAction } = await import(
      "@/app/admin/content/catalog/actions"
    );

    await expect(
      updateCatalogPageContentAction({
        eyebrow: "Paper & Stone",
        heading: "מוצרים",
        supportingText: "מבחר מוצרים פעילים מ-Paper & Stone.",
      }),
    ).rejects.toThrow("redirect");
  });

  it("upserts validated catalog content and revalidates", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    vi.mocked(requireAdmin).mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
      email: "admin@example.com",
      role: "admin",
      accountStatus: "approved",
      requestedRole: null,
    });

    const { updateCatalogPageContentAction } = await import(
      "@/app/admin/content/catalog/actions"
    );

    const result = await updateCatalogPageContentAction({
      eyebrow: "Paper & Stone",
      heading: "מוצרים מעודכנים",
      supportingText: "מבחר מוצרים פעילים מ-Paper & Stone.",
    });

    expect(result.success).toBe(true);
    expect(upsertCatalogPageContentMock).toHaveBeenCalledWith({
      eyebrow: "Paper & Stone",
      heading: "מוצרים מעודכנים",
      supportingText: "מבחר מוצרים פעילים מ-Paper & Stone.",
    });
    expect(revalidateCatalogPathsMock).toHaveBeenCalled();
  });
});
