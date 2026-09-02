import { describe, expect, it, vi, beforeEach } from "vitest";

const findOneMock = vi.fn();
const findMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Category", () => ({
  default: {
    findOne: findOneMock,
    find: findMock,
  },
}));

describe("resolveCategoryCatalogFilter", () => {
  beforeEach(() => {
    findOneMock.mockReset();
    findMock.mockReset();
  });

  it("returns empty filter for empty slug", async () => {
    const { resolveCategoryCatalogFilter } = await import(
      "@/lib/catalog/resolve-active-category-slug"
    );

    await expect(resolveCategoryCatalogFilter(null)).resolves.toEqual({
      categoryIds: [],
      appliedCategorySlug: null,
    });
    expect(findOneMock).not.toHaveBeenCalled();
  });

  it("returns leaf category id for leaf slug", async () => {
    const leafId = "507f1f77bcf86cd799439011";

    findOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: { toString: () => leafId },
        slug: "sofas",
        nameHe: "ספות",
        kind: "leaf",
        sortOrder: 1,
      }),
    });

    findMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue([
        {
          _id: { toString: () => leafId },
          slug: "sofas",
          nameHe: "ספות",
          kind: "leaf",
          parentId: { toString: () => "507f1f77bcf86cd799439012" },
          sortOrder: 1,
        },
      ]),
    });

    const { resolveCategoryCatalogFilter } = await import(
      "@/lib/catalog/resolve-active-category-slug"
    );
    const result = await resolveCategoryCatalogFilter("sofas");

    expect(findOneMock).toHaveBeenCalledWith({ slug: "sofas", isActive: true });
    expect(result.appliedCategorySlug).toBe("sofas");
    expect(result.categoryIds).toHaveLength(1);
    expect(result.categoryIds[0]?.toString()).toBe(leafId);
  });

  it("returns all descendant leaf ids for department slug", async () => {
    const livingId = "507f1f77bcf86cd799439010";
    const seatingId = "507f1f77bcf86cd799439012";
    const sofasId = "507f1f77bcf86cd799439011";

    findOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: { toString: () => livingId },
        slug: "living",
        nameHe: "מגורים",
        kind: "department",
        sortOrder: 1,
      }),
    });

    findMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue([
        {
          _id: { toString: () => livingId },
          slug: "living",
          nameHe: "מגורים",
          kind: "department",
          sortOrder: 1,
        },
        {
          _id: { toString: () => seatingId },
          slug: "seating",
          nameHe: "ישיבה",
          kind: "group",
          parentId: { toString: () => livingId },
          sortOrder: 1,
        },
        {
          _id: { toString: () => sofasId },
          slug: "sofas",
          nameHe: "ספות",
          kind: "leaf",
          parentId: { toString: () => seatingId },
          sortOrder: 1,
        },
      ]),
    });

    const { resolveCategoryCatalogFilter } = await import(
      "@/lib/catalog/resolve-active-category-slug"
    );
    const result = await resolveCategoryCatalogFilter("living");

    expect(result.appliedCategorySlug).toBe("living");
    expect(result.categoryIds.map((id) => id.toString())).toEqual([sofasId]);
  });

  it("returns null slug for unknown category", async () => {
    findOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    const { resolveCategoryCatalogFilter } = await import(
      "@/lib/catalog/resolve-active-category-slug"
    );

    await expect(resolveCategoryCatalogFilter("missing")).resolves.toEqual({
      categoryIds: [],
      appliedCategorySlug: null,
    });
  });
});
