import { describe, expect, it } from "vitest";
import {
  isAdminUser,
  isProfessionalUser,
} from "@/lib/auth/authorization";
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

  it("rejects professional users for admin check", () => {
    const user: SafeUser = {
      id: "3",
      email: "pro@example.com",
      role: "professional",
    };

    expect(isAdminUser(user)).toBe(false);
  });

  it("rejects null users for admin check", () => {
    expect(isAdminUser(null)).toBe(false);
  });

  it("accepts professional users", () => {
    const user: SafeUser = {
      id: "4",
      email: "pro@example.com",
      role: "professional",
    };

    expect(isProfessionalUser(user)).toBe(true);
  });

  it("rejects customer users for professional check", () => {
    const user: SafeUser = {
      id: "5",
      email: "customer@example.com",
      role: "customer",
    };

    expect(isProfessionalUser(user)).toBe(false);
  });

  it("rejects admin users for professional check", () => {
    const user: SafeUser = {
      id: "6",
      email: "admin@example.com",
      role: "admin",
    };

    expect(isProfessionalUser(user)).toBe(false);
  });

  it("rejects null users for professional check", () => {
    expect(isProfessionalUser(null)).toBe(false);
  });
});
