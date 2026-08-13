import { describe, expect, it } from "vitest";
import { isActiveAdminPath } from "@/lib/admin/is-active-admin-path";

describe("isActiveAdminPath", () => {
  it("matches /admin exactly", () => {
    expect(isActiveAdminPath("/admin", "/admin")).toBe(true);
    expect(isActiveAdminPath("/admin/products", "/admin")).toBe(false);
  });

  it("matches nested admin routes by prefix", () => {
    expect(isActiveAdminPath("/admin/products", "/admin/products")).toBe(true);
    expect(isActiveAdminPath("/admin/products/new", "/admin/products")).toBe(true);
    expect(isActiveAdminPath("/admin/projects/abc", "/admin/projects")).toBe(true);
  });

  it("does not match unrelated routes", () => {
    expect(isActiveAdminPath("/admin/users", "/admin/products")).toBe(false);
  });
});
