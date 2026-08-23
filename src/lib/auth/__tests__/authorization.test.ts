import { describe, expect, it } from "vitest";
import {
  isAdminUser,
  isArchitectUser,
  isClientUser,
  isProfessionalUser,
} from "@/lib/auth/authorization";
import type { SafeUser } from "@/types/user";

describe("authorization", () => {
  it("accepts admin users", () => {
    const user: SafeUser = {
      id: "1",
      email: "admin@example.com",
      role: "admin",
      accountStatus: "approved",
      requestedRole: null,
    };

    expect(isAdminUser(user)).toBe(true);
  });

  it("accepts client users", () => {
    const user: SafeUser = {
      id: "2",
      email: "client@example.com",
      role: "client",
      accountStatus: "approved",
      requestedRole: null,
    };

    expect(isClientUser(user)).toBe(true);
    expect(isAdminUser(user)).toBe(false);
    expect(isArchitectUser(user)).toBe(false);
  });

  it("accepts architect users", () => {
    const user: SafeUser = {
      id: "3",
      email: "architect@example.com",
      role: "architect",
      accountStatus: "approved",
      requestedRole: null,
    };

    expect(isArchitectUser(user)).toBe(true);
    expect(isProfessionalUser(user)).toBe(true);
    expect(isAdminUser(user)).toBe(false);
    expect(isClientUser(user)).toBe(false);
  });

  it("rejects null users for all role checks", () => {
    expect(isAdminUser(null)).toBe(false);
    expect(isClientUser(null)).toBe(false);
    expect(isArchitectUser(null)).toBe(false);
    expect(isProfessionalUser(null)).toBe(false);
  });

  it("does not treat client as architect even when applicant requested architect access", () => {
    const applicant: SafeUser = {
      id: "4",
      email: "applicant@example.com",
      role: "client",
      accountStatus: "pending",
      requestedRole: "architect",
    };

    expect(isArchitectUser(applicant)).toBe(false);
    expect(isProfessionalUser(applicant)).toBe(false);
    expect(isClientUser(applicant)).toBe(true);
  });
});
