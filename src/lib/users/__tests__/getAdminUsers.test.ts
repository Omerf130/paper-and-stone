import { describe, expect, it } from "vitest";
import { buildAdminUsersFilter } from "@/lib/users/getAdminUsers";

describe("buildAdminUsersFilter", () => {
  it("builds email search filter", () => {
    expect(
      buildAdminUsersFilter({
        query: "omer@",
        role: null,
        status: null,
        page: 1,
      }),
    ).toEqual({
      email: { $regex: "omer@", $options: "i" },
    });
  });

  it("combines role and status filters", () => {
    expect(
      buildAdminUsersFilter({
        query: null,
        role: "professional",
        status: "active",
        page: 1,
      }),
    ).toEqual({
      role: "professional",
      isActive: true,
    });
  });
});
