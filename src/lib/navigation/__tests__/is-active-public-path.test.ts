import { describe, expect, it } from "vitest";
import { isActivePublicPath } from "@/lib/navigation/is-active-public-path";

describe("isActivePublicPath", () => {
  it("matches home exactly", () => {
    expect(isActivePublicPath("/", "/")).toBe(true);
    expect(isActivePublicPath("/products", "/")).toBe(false);
  });

  it("matches products and nested product routes", () => {
    expect(isActivePublicPath("/products", "/products")).toBe(true);
    expect(isActivePublicPath("/products/milano-sofa", "/products")).toBe(true);
    expect(isActivePublicPath("/product", "/products")).toBe(false);
  });
});
