import { beforeEach, describe, expect, it, vi } from "vitest";

const findOneAndUpdateMock = vi.fn();
const existsMock = vi.fn();
const connectDBMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: connectDBMock,
}));

vi.mock("@/models/CatalogPageContent", () => ({
  default: {
    findOneAndUpdate: (...args: unknown[]) => findOneAndUpdateMock(...args),
    exists: (...args: unknown[]) => existsMock(...args),
  },
}));

describe("catalog-page-content-mutations", () => {
  beforeEach(() => {
    findOneAndUpdateMock.mockReset();
    existsMock.mockReset();
    connectDBMock.mockReset();
    findOneAndUpdateMock.mockResolvedValue({});
    existsMock.mockResolvedValue(null);
  });

  it("upserts singleton catalog content by key", async () => {
    const { upsertCatalogPageContent } = await import(
      "@/lib/cms/catalog-page-content-mutations"
    );

    await upsertCatalogPageContent({
      eyebrow: "Paper & Stone",
      heading: "מוצרים",
      supportingText: "מבחר מוצרים פעילים מ-Paper & Stone.",
    });

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { key: "catalog" },
      expect.objectContaining({
        $set: expect.objectContaining({
          key: "catalog",
          schemaVersion: 1,
          eyebrow: "Paper & Stone",
          heading: "מוצרים",
        }),
      }),
      expect.objectContaining({ upsert: true }),
    );
  });

  it("reports whether a catalog document exists", async () => {
    existsMock.mockResolvedValue({ _id: "catalog-doc" });

    const { catalogDocumentExists } = await import(
      "@/lib/cms/catalog-page-content-mutations"
    );

    await expect(catalogDocumentExists()).resolves.toBe(true);
  });
});
