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

  it("combines architect role and status filters with legacy compatibility", () => {
    expect(
      buildAdminUsersFilter({
        query: null,
        role: "architect",
        status: "active",
        page: 1,
      }),
    ).toEqual({
      role: { $in: ["architect", "professional"] },
      isActive: true,
    });
  });
});
