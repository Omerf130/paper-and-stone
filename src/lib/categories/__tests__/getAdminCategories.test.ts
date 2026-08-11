import { describe, expect, it, vi, beforeEach } from "vitest";

const findMock = vi.fn();
const aggregateMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Category", () => ({
  default: {
    find: findMock,
  },
}));

vi.mock("@/models/Product", () => ({
  default: {
    aggregate: aggregateMock,
  },
}));

describe("getAdminCategories", () => {
  beforeEach(() => {
    findMock.mockReset();
    aggregateMock.mockReset();

    findMock.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            _id: { toString: () => "cat-1" },
            nameHe: "ספות",
            slug: "sofas",
            isActive: true,
            sortOrder: 0,
            updatedAt: new Date("2026-01-01"),
          },
        ]),
      }),
    });

    aggregateMock.mockResolvedValue([{ _id: "cat-1", count: 5 }]);
  });

  it("counts all products without isActive filter", async () => {
    const { getAdminCategories } = await import(
      "@/lib/categories/getAdminCategories"
    );
    await getAdminCategories();

    expect(aggregateMock).toHaveBeenCalledWith([
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    ]);
  });

  it("maps product counts onto categories", async () => {
    const { getAdminCategories } = await import(
      "@/lib/categories/getAdminCategories"
    );
    const categories = await getAdminCategories();

    expect(categories[0]?.productCount).toBe(5);
  });
});
