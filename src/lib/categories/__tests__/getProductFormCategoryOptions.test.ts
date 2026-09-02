import { describe, expect, it, vi, beforeEach } from "vitest";

const findMock = vi.fn();
const findByIdMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Category", () => ({
  default: {
    find: findMock,
    findById: findByIdMock,
  },
}));

describe("getProductFormCategoryTree", () => {
  beforeEach(() => {
    findMock.mockReset();
    findByIdMock.mockReset();

    findMock.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              _id: { toString: () => "dept-1" },
              slug: "living",
              nameHe: "מגורים",
              kind: "department",
            },
            {
              _id: { toString: () => "group-1" },
              slug: "seating",
              nameHe: "ישיבה",
              kind: "group",
              parentId: { toString: () => "dept-1" },
            },
            {
              _id: { toString: () => "leaf-1" },
              slug: "sofas",
              nameHe: "ספות",
              kind: "leaf",
              parentId: { toString: () => "group-1" },
            },
          ]),
        }),
      }),
    });
  });

  it("returns hierarchical parent options and breadcrumb leaves", async () => {
    const { getProductFormCategoryTree } = await import(
      "@/lib/categories/getProductFormCategoryOptions"
    );
    const tree = await getProductFormCategoryTree();

    expect(findMock).toHaveBeenCalledWith({
      taxonomyKey: { $exists: true, $ne: null },
      isActive: true,
    });
    expect(tree.parentOptions).toHaveLength(2);
    expect(tree.leaves).toEqual([
      expect.objectContaining({
        id: "leaf-1",
        breadcrumb: "מגורים › ישיבה › ספות",
      }),
    ]);
  });

  it("includes inactive current leaf for edit flow", async () => {
    findByIdMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: { toString: () => "inactive-1" },
          slug: "legacy",
          nameHe: "ספות ישנות",
          kind: "leaf",
          parentId: { toString: () => "group-1" },
          isActive: false,
        }),
      }),
    });

    const { getProductFormCategoryTree } = await import(
      "@/lib/categories/getProductFormCategoryOptions"
    );
    const tree = await getProductFormCategoryTree("inactive-1");

    expect(tree.leaves.some((leaf) => leaf.id === "inactive-1")).toBe(true);
    expect(tree.leaves.find((leaf) => leaf.id === "inactive-1")).toEqual(
      expect.objectContaining({
        isActive: false,
        breadcrumb: "ספות ישנות",
      }),
    );
  });
});
