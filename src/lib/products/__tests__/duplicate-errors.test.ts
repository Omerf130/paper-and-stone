import { describe, expect, it } from "vitest";
import { isDuplicateKeyError } from "@/lib/products/product-validation";

describe("duplicate key errors", () => {
  it("maps slug duplicate errors", () => {
    expect(
      isDuplicateKeyError({
        code: 11000,
        keyPattern: { slug: 1 },
      }),
    ).toBe("slug");
  });

  it("maps sku duplicate errors", () => {
    expect(
      isDuplicateKeyError({
        code: 11000,
        keyPattern: { sku: 1 },
      }),
    ).toBe("sku");
  });

  it("returns null for unrelated errors", () => {
    expect(isDuplicateKeyError(new Error("other"))).toBeNull();
  });
});
