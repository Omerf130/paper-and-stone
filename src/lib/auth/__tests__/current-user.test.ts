import { describe, expect, it } from "vitest";
import { toSafeUser } from "@/lib/auth/current-user";

describe("toSafeUser", () => {
  it("returns normalized client role for legacy customer storage", () => {
    const user = toSafeUser({
      _id: { toString: () => "user-id" },
      email: "user@example.com",
      role: "customer",
      isActive: true,
    });

    expect(user).toEqual({
      id: "user-id",
      email: "user@example.com",
      role: "client",
      accountStatus: "approved",
      requestedRole: null,
    });
  });

  it("returns null for inactive users", () => {
    const user = toSafeUser({
      _id: { toString: () => "user-id" },
      email: "user@example.com",
      role: "client",
      isActive: false,
    });

    expect(user).toBeNull();
  });

  it("includes accountStatus and requestedRole in safe user", () => {
    const user = toSafeUser({
      _id: { toString: () => "user-id" },
      email: "user@example.com",
      role: "client",
      isActive: true,
      accountStatus: "pending",
      requestedRole: "architect",
    });

    expect(user).toEqual({
      id: "user-id",
      email: "user@example.com",
      role: "client",
      accountStatus: "pending",
      requestedRole: "architect",
    });
    expect(user).not.toHaveProperty("identificationNumber");
  });
});
