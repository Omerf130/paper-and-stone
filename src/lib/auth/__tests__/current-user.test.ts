import { describe, expect, it } from "vitest";
import { toSafeUser } from "@/lib/auth/current-user";

describe("toSafeUser", () => {
  it("rejects inactive users", () => {
    const result = toSafeUser({
      _id: { toString: () => "user-id" },
      email: "inactive@example.com",
      role: "customer",
      isActive: false,
    });

    expect(result).toBeNull();
  });

  it("returns a safe user for active users", () => {
    const result = toSafeUser({
      _id: { toString: () => "user-id" },
      email: "active@example.com",
      role: "customer",
      isActive: true,
    });

    expect(result).toEqual({
      id: "user-id",
      email: "active@example.com",
      role: "customer",
    });
  });
});
