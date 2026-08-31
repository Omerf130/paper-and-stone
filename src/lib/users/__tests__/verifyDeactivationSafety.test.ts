import { describe, expect, it, vi, beforeEach } from "vitest";

const countClientProjectsMock = vi.fn();
const countOwnedProjectsMock = vi.fn();

vi.mock("@/lib/users/verifyClientRoleChange", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/users/verifyClientRoleChange")>();
  return {
    ...actual,
    countActiveProjectsForClient: countClientProjectsMock,
  };
});

vi.mock("@/lib/users/verifyArchitectDowngrade", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/users/verifyArchitectDowngrade")>();
  return {
    ...actual,
    countOwnedProjects: countOwnedProjectsMock,
  };
});

const userId = "507f1f77bcf86cd799439012";

describe("verifyDeactivationSafety", () => {
  beforeEach(() => {
    countClientProjectsMock.mockReset();
    countOwnedProjectsMock.mockReset();
  });

  it("blocks client deactivation when assigned to active projects", async () => {
    countClientProjectsMock.mockResolvedValue(2);

    const { verifyClientDeactivationSafety } = await import(
      "@/lib/users/verifyDeactivationSafety"
    );
    const { UserMutationError } = await import("@/lib/users/user-errors");
    const { CRM_ERRORS } = await import("@/types/admin-crm");

    await expect(
      verifyClientDeactivationSafety(userId, "client", false),
    ).rejects.toMatchObject({ message: CRM_ERRORS.DEACTIVATE_CLIENT_ASSIGNED });
    await expect(
      verifyClientDeactivationSafety(userId, "client", false),
    ).rejects.toBeInstanceOf(UserMutationError);
  });

  it("blocks architect deactivation when owning projects", async () => {
    countOwnedProjectsMock.mockResolvedValue(1);

    const { verifyArchitectDeactivationSafety } = await import(
      "@/lib/users/verifyDeactivationSafety"
    );
    const { CRM_ERRORS } = await import("@/types/admin-crm");

    await expect(
      verifyArchitectDeactivationSafety(userId, "architect", false),
    ).rejects.toMatchObject({ message: CRM_ERRORS.DEACTIVATE_ARCHITECT_OWNS });
  });

  it("allows deactivation when no blocking projects exist", async () => {
    countClientProjectsMock.mockResolvedValue(0);
    countOwnedProjectsMock.mockResolvedValue(0);

    const {
      verifyClientDeactivationSafety,
      verifyArchitectDeactivationSafety,
    } = await import("@/lib/users/verifyDeactivationSafety");

    await expect(
      verifyClientDeactivationSafety(userId, "client", false),
    ).resolves.toBeUndefined();
    await expect(
      verifyArchitectDeactivationSafety(userId, "architect", false),
    ).resolves.toBeUndefined();
  });
});
