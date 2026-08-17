import { describe, expect, it } from "vitest";
import { isArchitectUser, isClientUser } from "@/lib/auth/authorization";
import type { SafeUser } from "@/types/user";

describe("client privacy boundary", () => {
  it("requestedRole architect does not grant architect guard access", () => {
    const applicant: SafeUser = {
      id: "applicant-id",
      email: "applicant@example.com",
      role: "client",
    };

    expect(isArchitectUser(applicant)).toBe(false);
    expect(isClientUser(applicant)).toBe(true);
  });

  it("safe user shape excludes admin-only identity fields", () => {
    const safeUser: SafeUser = {
      id: "user-id",
      email: "user@example.com",
      role: "client",
    };

    expect(Object.keys(safeUser)).toEqual(["id", "email", "role"]);
  });
});
