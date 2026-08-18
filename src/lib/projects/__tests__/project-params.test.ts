import { describe, expect, it } from "vitest";
import {
  buildAdminProjectsHref,
  parseAdminProjectsParams,
} from "@/lib/projects/project-params";

describe("project-params", () => {
  it("defaults admin list status to submitted and commercial queue", () => {
    expect(parseAdminProjectsParams({})).toEqual({
      query: null,
      queue: "commercial",
      status: "submitted",
      page: 1,
    });
  });

  it("parses query, status, queue, and page", () => {
    expect(
      parseAdminProjectsParams({
        q: "  villa ",
        status: "approved",
        queue: "onboarding",
        page: "2",
      }),
    ).toEqual({
      query: "villa",
      queue: "onboarding",
      status: "approved",
      page: 2,
    });
  });

  it("builds admin projects href preserving queue", () => {
    expect(
      buildAdminProjectsHref({
        query: "test",
        queue: "onboarding",
        page: 2,
      }),
    ).toBe("/admin/projects?q=test&queue=onboarding&page=2");
  });

  it("builds admin projects href preserving filters", () => {
    expect(
      buildAdminProjectsHref({
        query: "test",
        status: "rejected",
        page: 3,
      }),
    ).toBe("/admin/projects?q=test&status=rejected&page=3");
  });
});
