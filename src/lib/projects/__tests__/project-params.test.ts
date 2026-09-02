import { describe, expect, it } from "vitest";
import {
  buildAdminProjectsHref,
  parseAdminProjectsParams,
} from "@/lib/projects/project-params";

describe("project-params", () => {
  it("defaults admin list to attention queue", () => {
    expect(parseAdminProjectsParams({})).toEqual({
      query: null,
      queue: "attention",
      status: "submitted",
      clientId: null,
      architectId: null,
      page: 1,
    });
  });

  it("parses query, status, queue, page, and id filters", () => {
    expect(
      parseAdminProjectsParams({
        q: "  villa ",
        status: "approved",
        queue: "onboarding",
        clientId: "507f1f77bcf86cd799439011",
        architectId: "507f191e810c19729de860ea",
        page: "2",
      }),
    ).toEqual({
      query: "villa",
      queue: "onboarding",
      status: "approved",
      clientId: "507f1f77bcf86cd799439011",
      architectId: "507f191e810c19729de860ea",
      page: 2,
    });
  });

  it("ignores invalid object id filters", () => {
    expect(
      parseAdminProjectsParams({
        clientId: "not-an-id",
        architectId: "123",
      }).clientId,
    ).toBeNull();
    expect(
      parseAdminProjectsParams({
        architectId: "not-an-id",
      }).architectId,
    ).toBeNull();
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
        clientId: "507f1f77bcf86cd799439011",
        architectId: "507f191e810c19729de860ea",
        page: 3,
      }),
    ).toBe(
      "/admin/projects?q=test&status=rejected&clientId=507f1f77bcf86cd799439011&architectId=507f191e810c19729de860ea&page=3",
    );
  });
});
