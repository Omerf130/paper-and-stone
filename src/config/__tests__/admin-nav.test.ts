import { describe, expect, it } from "vitest";
import { applyAdminNavBadges, adminNavGroups } from "@/config/admin-nav";

describe("applyAdminNavBadges", () => {
  it("badges architect requests and attention project count", () => {
    const groups = applyAdminNavBadges(adminNavGroups, {
      attentionProjectCount: 6,
      pendingArchitectRequestCount: 2,
    });

    const projectsItem = groups
      .flatMap((group) => group.items)
      .find((item) => item.href === "/admin/projects");
    const architectRequestsItem = groups
      .flatMap((group) => group.items)
      .find((item) => item.href === "/admin/architect-requests");

    expect(projectsItem?.badgeCount).toBe(6);
    expect(architectRequestsItem?.badgeCount).toBe(2);
  });
});
