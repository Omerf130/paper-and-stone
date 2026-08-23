import { describe, expect, it, vi } from "vitest";
import {
  SAFETY_ERRORS,
  verifySelfDeactivation,
  verifySelfRoleChange,
  verifyLastActiveAdmin,
} from "@/lib/users/verifyAdminSafety";
import { UserMutationError } from "@/lib/users/user-errors";

describe("verifyAdminSafety", () => {
  const currentAdmin = {
    id: "admin-1",
    email: "admin@example.com",
    role: "admin" as const,
    accountStatus: "approved" as const,
    requestedRole: null,
  };

  it("rejects self-demotion from admin", () => {
    expect(() =>
      verifySelfRoleChange(
        currentAdmin,
        { id: "admin-1", role: "admin", isActive: true },
        "client",
      ),
    ).toThrow(UserMutationError);

    try {
      verifySelfRoleChange(
        currentAdmin,
        { id: "admin-1", role: "admin", isActive: true },
        "architect",
      );
    } catch (error) {
      expect(error).toBeInstanceOf(UserMutationError);
      expect((error as UserMutationError).message).toBe(
        SAFETY_ERRORS.SELF_DEMOTION,
      );
    }
  });

  it("rejects self-deactivation", () => {
    expect(() =>
      verifySelfDeactivation(
        currentAdmin,
        { id: "admin-1", role: "admin", isActive: true },
        false,
      ),
    ).toThrow(SAFETY_ERRORS.SELF_DEACTIVATION);
  });

  it("rejects removing the last active admin by role change", async () => {
    const countActiveAdmins = vi.fn().mockResolvedValue(1);

    await expect(
      verifyLastActiveAdmin(
        { id: "admin-1", role: "admin", isActive: true },
        "client",
        null,
        countActiveAdmins,
      ),
    ).rejects.toThrow(SAFETY_ERRORS.LAST_ADMIN);
  });

  it("rejects deactivating the last active admin", async () => {
    const countActiveAdmins = vi.fn().mockResolvedValue(1);

    await expect(
      verifyLastActiveAdmin(
        { id: "admin-1", role: "admin", isActive: true },
        null,
        false,
        countActiveAdmins,
      ),
    ).rejects.toThrow(SAFETY_ERRORS.LAST_ADMIN);
  });

  it("allows demotion when another active admin exists", async () => {
    const countActiveAdmins = vi.fn().mockResolvedValue(2);

    await expect(
      verifyLastActiveAdmin(
        { id: "admin-1", role: "admin", isActive: true },
        "client",
        null,
        countActiveAdmins,
      ),
    ).resolves.toBeUndefined();
  });
});
