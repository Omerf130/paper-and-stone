import { describe, expect, it, vi, beforeEach } from "vitest";

const toggleMock = vi.fn();
const removeMock = vi.fn();

vi.mock("@/lib/auth/authorization", () => ({
  requireUser: vi.fn(async () => ({
    id: "507f1f77bcf86cd799439011",
    email: "user@example.com",
    role: "client" as const,
    accountStatus: "approved" as const,
    requestedRole: null,
  })),
}));

vi.mock("@/lib/wishlist/wishlist-queries", () => ({
  toggleWishlistItem: toggleMock,
  removeWishlistItem: removeMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("wishlist actions", () => {
  beforeEach(() => {
    toggleMock.mockReset();
    removeMock.mockReset();
  });

  it("derives userId from requireUser when toggling wishlist", async () => {
    toggleMock.mockResolvedValue({ isWishlisted: true });

    const { toggleProductWishlistAction } = await import(
      "@/app/(public)/products/wishlist-actions"
    );

    const result = await toggleProductWishlistAction("milano-sofa");

    expect(toggleMock).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      "milano-sofa",
    );
    expect(result.isWishlisted).toBe(true);
  });

  it("derives userId from requireUser when removing wishlist item", async () => {
    removeMock.mockResolvedValue(true);

    const { removeProductFromWishlistAction } = await import(
      "@/app/(public)/products/wishlist-actions"
    );

    const result = await removeProductFromWishlistAction("milano-sofa");

    expect(removeMock).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      "milano-sofa",
    );
    expect(result.isWishlisted).toBe(false);
  });
});
