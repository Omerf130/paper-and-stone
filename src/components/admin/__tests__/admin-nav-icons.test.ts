import { describe, expect, it } from "vitest";
import { adminNavItems } from "@/config/admin-nav";
import {
  allAdminNavItemsHaveIcons,
  getAdminNavIcon,
} from "@/components/admin/admin-nav-icons";

describe("admin-nav-icons", () => {
  it("maps every admin nav item to an icon", () => {
    expect(allAdminNavItemsHaveIcons()).toBe(true);

    for (const item of adminNavItems) {
      expect(getAdminNavIcon(item.href)).toBeDefined();
    }
  });
});
