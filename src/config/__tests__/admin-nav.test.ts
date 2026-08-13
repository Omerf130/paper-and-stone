import { describe, expect, it } from "vitest";
import {
  adminNavGroups,
  adminNavItems,
  applyAdminNavBadges,
} from "@/config/admin-nav";

describe("admin-nav", () => {
  it("contains all admin routes in groups", () => {
    const hrefs = adminNavGroups.flatMap((group) =>
      group.items.map((item) => item.href),
    );

    expect(hrefs).toEqual([
      "/admin",
      "/admin/products",
      "/admin/categories",
      "/admin/materials",
      "/admin/colors",
      "/admin/projects",
      "/admin/content",
      "/admin/users",
    ]);
  });

  it("derives a flat nav list from groups", () => {
    expect(adminNavItems).toHaveLength(8);
    expect(adminNavItems.map((item) => item.label)).toContain("פרויקטים");
  });

  it("applies submitted project badge only to projects route", () => {
    const groups = applyAdminNavBadges(adminNavGroups, 4);
    const projectsItem = groups
      .flatMap((group) => group.items)
      .find((item) => item.href === "/admin/projects");

    expect(projectsItem?.badgeCount).toBe(4);

    const otherBadges = groups
      .flatMap((group) => group.items)
      .filter((item) => item.href !== "/admin/projects")
      .some((item) => item.badgeCount !== undefined);

    expect(otherBadges).toBe(false);
  });
});
