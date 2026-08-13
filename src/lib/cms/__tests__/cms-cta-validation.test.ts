import { describe, expect, it } from "vitest";
import { isSafeInternalCtaHref } from "@/lib/cms/cms-cta-validation";

describe("cms-cta-validation", () => {
  it("accepts safe internal paths", () => {
    expect(isSafeInternalCtaHref("/products")).toBe(true);
    expect(isSafeInternalCtaHref("/register")).toBe(true);
    expect(isSafeInternalCtaHref("/products?category=sofas")).toBe(true);
  });

  it("rejects protocol-relative URLs", () => {
    expect(isSafeInternalCtaHref("//example.com")).toBe(false);
  });

  it("rejects absolute http and https URLs", () => {
    expect(isSafeInternalCtaHref("https://example.com")).toBe(false);
    expect(isSafeInternalCtaHref("http://example.com")).toBe(false);
  });

  it("rejects javascript and data URLs", () => {
    expect(isSafeInternalCtaHref("javascript:alert(1)")).toBe(false);
    expect(isSafeInternalCtaHref("/javascript:alert(1)")).toBe(false);
    expect(isSafeInternalCtaHref("data:text/html,hello")).toBe(false);
  });

  it("rejects paths that do not start with slash", () => {
    expect(isSafeInternalCtaHref("products")).toBe(false);
    expect(isSafeInternalCtaHref("")).toBe(false);
  });
});
