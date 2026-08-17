import { describe, expect, it } from "vitest";
import { parseAdminUsersParams } from "@/lib/users/user-params";

describe("parseAdminUsersParams", () => {
  it("parses architect role filter", () => {
    expect(
      parseAdminUsersParams({
        role: "architect",
        page: "2",
      }),
    ).toEqual({
      query: null,
      role: "architect",
      status: null,
      page: 2,
    });
  });

  it("ignores legacy professional role filter", () => {
    expect(
      parseAdminUsersParams({
        role: "professional",
      }).role,
    ).toBeNull();
  });
});
