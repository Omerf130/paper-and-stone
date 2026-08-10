import { describe, expect, it, vi, beforeEach } from "vitest";

const findMock = vi.fn();
const limitMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Product", () => ({
  default: {
    find: findMock,
  },
}));

vi.mock("@/models/Category", () => ({
  default: {},
}));

describe("getFeaturedProducts", () => {
  beforeEach(() => {
    findMock.mockReset();
    limitMock.mockReset();

    limitMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue([]),
    });

    findMock.mockReturnValue({
      populate: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            limit: limitMock,
          }),
        }),
      }),
    });
  });

  it("queries active and featured products with a limit", async () => {
    const { getFeaturedProducts, FEATURED_PRODUCT_LIMIT } = await import(
      "@/lib/products/getFeaturedProducts"
    );
    await getFeaturedProducts();

    expect(findMock).toHaveBeenCalledWith({
      isActive: true,
      isFeatured: true,
    });
    expect(limitMock).toHaveBeenCalledWith(FEATURED_PRODUCT_LIMIT);
  });
});
