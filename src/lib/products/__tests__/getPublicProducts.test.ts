import { Types } from "mongoose";
import { describe, expect, it, vi, beforeEach } from "vitest";

const countDocumentsMock = vi.fn();
const findMock = vi.fn();
const aggregateMock = vi.fn();
const categoryFindMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/lib/catalog/resolve-active-category-slug", () => ({
  resolveActiveCategorySlug: vi.fn(async (slug: string | null) => {
    if (slug === "sofas") {
      return new Types.ObjectId("507f1f77bcf86cd799439011");
    }

    return null;
  }),
}));

vi.mock("@/models/Product", () => ({
  default: {
    countDocuments: countDocumentsMock,
    find: findMock,
    aggregate: aggregateMock,
  },
}));

vi.mock("@/models/Category", () => ({
  default: {
    find: categoryFindMock,
    findOne: vi.fn(),
  },
}));

describe("getPublicProducts", () => {
  beforeEach(() => {
    countDocumentsMock.mockReset();
    findMock.mockReset();
    aggregateMock.mockReset();
    categoryFindMock.mockReset();
    countDocumentsMock.mockResolvedValue(0);
    aggregateMock.mockResolvedValue([]);
    categoryFindMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      }),
    });
    findMock.mockReturnValue({
      populate: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            skip: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                lean: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      }),
    });
  });

  it("counts and paginates at the database level", async () => {
    countDocumentsMock.mockResolvedValue(24);

    const { getPublicProducts } = await import("@/lib/products/getPublicProducts");

    await getPublicProducts({ page: 2 });

    expect(countDocumentsMock).toHaveBeenCalledWith({ isActive: true });
    expect(findMock).toHaveBeenCalledWith({ isActive: true });

    const chain = findMock.mock.results[0]?.value;
    expect(chain.populate).toHaveBeenCalled();
    expect(chain.populate().select().sort().skip).toHaveBeenCalledWith(12);
    expect(chain.populate().select().sort().skip().limit).toHaveBeenCalledWith(12);
  });

  it("ignores unknown category slug for filtering", async () => {
    const { getPublicProducts } = await import("@/lib/products/getPublicProducts");
    const result = await getPublicProducts({ categorySlug: "missing" });

    expect(countDocumentsMock).toHaveBeenCalledWith({ isActive: true });
    expect(result.appliedFilters.categorySlug).toBeNull();
  });

  it("applies resolved active category slug", async () => {
    const categoryId = new Types.ObjectId("507f1f77bcf86cd799439011");
    const { getPublicProducts } = await import("@/lib/products/getPublicProducts");
    const result = await getPublicProducts({ categorySlug: "sofas" });

    expect(countDocumentsMock).toHaveBeenCalledWith({
      isActive: true,
      categoryId,
    });
    expect(result.appliedFilters.categorySlug).toBe("sofas");
  });

  it("returns paginated result shape", async () => {
    countDocumentsMock.mockResolvedValue(24);

    const { getPublicProducts } = await import("@/lib/products/getPublicProducts");
    const result = await getPublicProducts({ query: "milano", page: 999 });

    expect(result).toEqual({
      products: [],
      total: 24,
      page: 2,
      pageSize: 12,
      totalPages: 2,
      appliedFilters: {
        query: "milano",
        categorySlug: null,
      },
    });
  });
});
