import { describe, expect, it, vi, beforeEach } from "vitest";

const findOneMock = vi.fn();
const createMock = vi.fn();
const deleteOneMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(async () => undefined),
}));

vi.mock("@/models/WishlistItem", () => ({
  default: {
    findOne: findOneMock,
    create: createMock,
    deleteOne: deleteOneMock,
  },
}));

describe("wishlist queries ownership", () => {
  beforeEach(() => {
    findOneMock.mockReset();
    createMock.mockReset();
    deleteOneMock.mockReset();
  });

  it("scopes wishlist lookup to the current user and product slug", async () => {
    findOneMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      }),
    });

    const { isProductWishlisted } = await import("@/lib/wishlist/wishlist-queries");

    await isProductWishlisted("user-a", "milano-sofa");

    expect(findOneMock).toHaveBeenCalledWith({
      userId: "user-a",
      productSlug: "milano-sofa",
    });
  });

  it("removes only the current user's wishlist item", async () => {
    deleteOneMock.mockResolvedValue({ deletedCount: 1 });

    const { removeWishlistItem } = await import("@/lib/wishlist/wishlist-queries");

    await removeWishlistItem("user-a", "milano-sofa");

    expect(deleteOneMock).toHaveBeenCalledWith({
      userId: "user-a",
      productSlug: "milano-sofa",
    });
  });
});
