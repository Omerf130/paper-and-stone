import { describe, expect, it } from "vitest";
import { buildAdminProjectsFilter } from "@/lib/projects/getAdminProjects";

describe("buildAdminProjectsFilter", () => {
  it("filters onboarding queue to pending approval", () => {
    expect(
      buildAdminProjectsFilter({ queue: "onboarding", status: "submitted" }),
    ).toEqual({
      onboardingStatus: "pending_approval",
    });
  });

  it("excludes new-workflow projects from commercial queue", () => {
    expect(
      buildAdminProjectsFilter({ queue: "commercial", status: "submitted" }),
    ).toEqual({
      $and: [
        { status: "submitted" },
        {
          $or: [
            { onboardingStatus: null },
            { onboardingStatus: { $exists: false } },
          ],
        },
      ],
    });
  });
});
