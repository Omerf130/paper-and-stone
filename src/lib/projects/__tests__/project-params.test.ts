import { describe, expect, it } from "vitest";
import {
  buildAdminProjectsHref,
  parseAdminProjectsParams,
} from "@/lib/projects/project-params";

describe("project-params", () => {
  it("defaults admin list status to submitted", () => {
    expect(parseAdminProjectsParams({})).toEqual({
      query: null,
      status: "submitted",
      page: 1,
    });
  });

  it("parses query, status, and page", () => {
    expect(
      parseAdminProjectsParams({
        q: "  villa ",
        status: "approved",
        page: "2",
      }),
    ).toEqual({
      query: "villa",
      status: "approved",
      page: 2,
    });
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
