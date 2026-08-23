import { describe, expect, it } from "vitest";
import {
  buildLoginHref,
  buildRegisterHref,
  resolveSafeNextUrl,
} from "@/lib/auth/safe-next-url";

describe("safe-next-url", () => {
  it("accepts internal paths only", () => {
    expect(resolveSafeNextUrl("/products/milano-sofa?project=1&room=2")).toBe(
      "/products/milano-sofa?project=1&room=2",
    );
    expect(resolveSafeNextUrl("https://evil.example")).toBeNull();
    expect(resolveSafeNextUrl("//evil.example")).toBeNull();
  });

  it("builds login and register hrefs with encoded next", () => {
    expect(buildLoginHref("/products/foo")).toBe(
      "/login?next=%2Fproducts%2Ffoo",
    );
    expect(buildRegisterHref("/products/foo")).toBe(
      "/register?next=%2Fproducts%2Ffoo",
    );
  });
});
