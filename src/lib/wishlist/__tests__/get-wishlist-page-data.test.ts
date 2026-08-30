import { describe, expect, it } from "vitest";
import {
  getWishlistPageData,
  hasWishlistProducts,
} from "@/lib/wishlist/get-wishlist-page-data";

describe("hasWishlistProducts", () => {
  it("returns false for an empty wishlist page payload", () => {
    expect(hasWishlistProducts({ products: [], totalSaved: 0 })).toBe(false);
  });

  it("returns true when products are present", () => {
    expect(
      hasWishlistProducts({
        products: [
          {
            slug: "milano-sofa",
            nameHe: "Milano",
            category: "Sofas",
            primaryImage: null,
          },
        ],
        totalSaved: 1,
      }),
    ).toBe(true);
  });
});

describe("getWishlistPageData ownership contract", () => {
  it("exports a user-scoped loader function", () => {
    expect(typeof getWishlistPageData).toBe("function");
    expect(getWishlistPageData.length).toBe(1);
  });
});
