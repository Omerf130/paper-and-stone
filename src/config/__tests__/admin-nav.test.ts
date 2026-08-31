import { describe, expect, it } from "vitest";
import { applyAdminNavBadges, adminNavGroups } from "@/config/admin-nav";

describe("applyAdminNavBadges", () => {
  it("badges attention project count only", () => {
    const groups = applyAdminNavBadges(adminNavGroups, {
      attentionProjectCount: 6,
      pendingArchitectRequestCount: 2,
      pendingClientRequestCount: 3,
    });

    const projectsItem = groups
      .flatMap((group) => group.items)
      .find((item) => item.href === "/admin/projects");
    const clientRequestsItem = groups
      .flatMap((group) => group.items)
      .find((item) => item.href === "/admin/client-requests");
    const architectRequestsItem = groups
      .flatMap((group) => group.items)
      .find((item) => item.href === "/admin/architect-requests");

    expect(projectsItem?.badgeCount).toBe(6);
    expect(clientRequestsItem).toBeUndefined();
    expect(architectRequestsItem).toBeUndefined();
  });

  it("does not include request queues in sidebar navigation", () => {
    const hrefs = adminNavGroups.flatMap((group) =>
      group.items.map((item) => item.href),
    );

    expect(hrefs).not.toContain("/admin/client-requests");
    expect(hrefs).not.toContain("/admin/architect-requests");
  });

  it("includes CRM workspaces in people navigation group", () => {
    const peopleGroup = adminNavGroups.find((group) => group.id === "people");

    expect(peopleGroup?.items.map((item) => item.href)).toEqual([
      "/admin/clients",
      "/admin/architects",
    ]);
  });
});
