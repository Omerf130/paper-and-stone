import { describe, expect, it } from "vitest";
import {
  detectSkuNormalizedCollisions,
  normalizeProductSku,
} from "@/lib/products/normalize-product-sku";

describe("normalizeProductSku", () => {
  it("trims and lowercases SKU for uniqueness checks", () => {
    expect(normalizeProductSku("  PS-100  ")).toBe("ps-100");
    expect(normalizeProductSku("ABC-1")).toBe("abc-1");
  });
});

describe("detectSkuNormalizedCollisions", () => {
  it("returns empty array when all normalized SKUs are unique", () => {
    expect(
      detectSkuNormalizedCollisions([
        { id: "1", sku: "PS-100" },
        { id: "2", sku: "PS-200" },
      ]),
    ).toEqual([]);
  });

  it("detects case-insensitive collisions", () => {
    expect(
      detectSkuNormalizedCollisions([
        { id: "1", sku: "ABC-1" },
        { id: "2", sku: "abc-1" },
      ]),
    ).toEqual([
      {
        normalizedSku: "abc-1",
        products: [
          { id: "1", sku: "ABC-1" },
          { id: "2", sku: "abc-1" },
        ],
      },
    ]);
  });
});
