import { describe, expect, it } from "vitest";
import { adminNavGroups } from "@/config/admin-nav";

describe("admin nav phase 19B", () => {
  it("removes standalone colors and categories links", () => {
    const catalogItems = adminNavGroups.find((group) => group.id === "catalog")
      ?.items;

    expect(catalogItems?.map((item) => item.href)).toEqual([
      "/admin/products",
      "/admin/suppliers",
      "/admin/materials",
    ]);
  });
});
