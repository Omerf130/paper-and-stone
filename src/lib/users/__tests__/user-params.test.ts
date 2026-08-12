import { describe, expect, it } from "vitest";
import {
  buildAdminUsersHref,
  parseAdminUsersParams,
} from "@/lib/users/user-params";

describe("user-params", () => {
  it("parses search, role, status, and page params", () => {
    expect(
      parseAdminUsersParams({
        q: " omer ",
        role: "professional",
        status: "active",
        page: "3",
      }),
    ).toEqual({
      query: "omer",
      role: "professional",
      status: "active",
      page: 3,
    });
  });

  it("defaults invalid page to 1", () => {
    expect(parseAdminUsersParams({ page: "abc" }).page).toBe(1);
  });

  it("builds href preserving all filters", () => {
    expect(
      buildAdminUsersHref({
        query: "omer",
        role: "admin",
        status: "inactive",
        page: 2,
      }),
    ).toBe("/admin/users?q=omer&role=admin&status=inactive&page=2");
  });
});
