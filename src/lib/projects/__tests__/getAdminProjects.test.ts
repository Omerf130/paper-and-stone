import { describe, expect, it } from "vitest";
import { buildAdminProjectsFilter } from "@/lib/projects/getAdminProjects";
import { buildAdminProjectAttentionFilter } from "@/lib/projects/admin-project-attention";

describe("buildAdminProjectsFilter", () => {
  it("filters onboarding queue to pending approval", () => {
    expect(
      buildAdminProjectsFilter({ queue: "onboarding", status: "submitted" }),
    ).toEqual({
      onboardingStatus: "pending_approval",
    });
  });

  it("filters active queue to onboardingStatus active", () => {
    expect(
      buildAdminProjectsFilter({ queue: "active", status: "submitted" }),
    ).toEqual({
      onboardingStatus: "active",
    });
  });

  it("includes new-workflow projects in commercial queue", () => {
    expect(
      buildAdminProjectsFilter({ queue: "commercial", status: "submitted" }),
    ).toEqual({
      status: "submitted",
    });
  });

  it("uses attention filter for attention queue", () => {
    expect(
      buildAdminProjectsFilter({ queue: "attention", status: "submitted" }),
    ).toEqual(buildAdminProjectAttentionFilter());
  });
});
