import { describe, expect, it } from "vitest";
import { isAdminUser } from "@/lib/auth/authorization";
import type { SafeUser } from "@/types/user";

describe("authorization", () => {
  it("accepts admin users", () => {
    const user: SafeUser = {
      id: "1",
      email: "admin@example.com",
      role: "admin",
    };

    expect(isAdminUser(user)).toBe(true);
  });

  it("rejects customer users", () => {
    const user: SafeUser = {
      id: "2",
      email: "customer@example.com",
      role: "customer",
    };

    expect(isAdminUser(user)).toBe(false);
  });

  it("rejects professional users", () => {
    const user: SafeUser = {
      id: "3",
      email: "pro@example.com",
      role: "professional",
    };

    expect(isAdminUser(user)).toBe(false);
  });

  it("rejects null users", () => {
    expect(isAdminUser(null)).toBe(false);
  });
});
