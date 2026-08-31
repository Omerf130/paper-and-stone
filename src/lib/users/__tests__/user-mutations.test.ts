import { describe, expect, it, vi, beforeEach } from "vitest";

const findUserByIdMock = vi.fn();
const updateOneMock = vi.fn();
const deleteSessionsForUserMock = vi.fn();
const countActiveAdminsMock = vi.fn();
const verifyArchitectDowngradeSafetyMock = vi.fn();
const ensureProfileMock = vi.fn();
const verifyClientDeactivationMock = vi.fn();
const verifyArchitectDeactivationMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/User", () => ({
  default: {
    updateOne: updateOneMock,
  },
}));

vi.mock("@/lib/users/user-queries", () => ({
  findUserByIdForAdmin: findUserByIdMock,
  countActiveAdmins: countActiveAdminsMock,
}));

vi.mock("@/lib/auth/session", () => ({
  deleteSessionsForUser: deleteSessionsForUserMock,
}));

vi.mock("@/lib/users/verifyArchitectDowngrade", () => ({
  verifyArchitectDowngradeSafety: verifyArchitectDowngradeSafetyMock,
}));

vi.mock("@/lib/users/verifyClientRoleChange", () => ({
  verifyClientRoleChangeSafety: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/users/verifyDeactivationSafety", () => ({
  verifyClientDeactivationSafety: verifyClientDeactivationMock,
  verifyArchitectDeactivationSafety: verifyArchitectDeactivationMock,
}));

vi.mock("@/lib/professionals/ensureProfessionalProfile", () => ({
  ensureProfessionalProfile: ensureProfileMock,
}));

describe("user-mutations", () => {
  beforeEach(() => {
    findUserByIdMock.mockReset();
    updateOneMock.mockReset();
    deleteSessionsForUserMock.mockReset();
    countActiveAdminsMock.mockReset();
    verifyArchitectDowngradeSafetyMock.mockReset();
    ensureProfileMock.mockReset();
    verifyClientDeactivationMock.mockReset();
    verifyArchitectDeactivationMock.mockReset();
    updateOneMock.mockResolvedValue({ matchedCount: 1 });
    countActiveAdminsMock.mockResolvedValue(2);
    verifyArchitectDowngradeSafetyMock.mockResolvedValue(undefined);
    ensureProfileMock.mockResolvedValue(undefined);
    verifyClientDeactivationMock.mockResolvedValue(undefined);
    verifyArchitectDeactivationMock.mockResolvedValue(undefined);
  });

  it("updates role and clears requestedRole", async () => {
    findUserByIdMock.mockResolvedValue({
      _id: { toString: () => "user-2" },
      role: "client",
      isActive: true,
    });

    const { updateUserRole } = await import("@/lib/users/user-mutations");

    await updateUserRole(
      { id: "admin-1", email: "admin@example.com", role: "admin", accountStatus: "approved", requestedRole: null },
      "507f1f77bcf86cd799439011",
      "architect",
    );

    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: "507f1f77bcf86cd799439011" },
      { $set: { role: "architect", requestedRole: null } },
    );
    expect(ensureProfileMock).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
  });

  it("blocks architect downgrade when user owns projects", async () => {
    const { UserMutationError } = await import("@/lib/users/user-errors");

    findUserByIdMock.mockResolvedValue({
      _id: { toString: () => "user-2" },
      role: "architect",
      isActive: true,
    });
    verifyArchitectDowngradeSafetyMock.mockRejectedValue(
      new UserMutationError(
        "לא ניתן להוריד ללקוח אדריכל שבבעלותו פרויקטים במערכת.",
      ),
    );

    const { updateUserRole } = await import("@/lib/users/user-mutations");

    await expect(
      updateUserRole(
        { id: "admin-1", email: "admin@example.com", role: "admin", accountStatus: "approved", requestedRole: null },
        "507f1f77bcf86cd799439011",
        "client",
      ),
    ).rejects.toThrow("לא ניתן להוריד ללקוח אדריכל שבבעלותו פרויקטים במערכת.");

    expect(updateOneMock).not.toHaveBeenCalled();
  });

  it("deletes sessions when deactivating a user", async () => {
    findUserByIdMock.mockResolvedValue({
      _id: { toString: () => "user-2" },
      role: "client",
      isActive: true,
    });

    const { updateUserActiveStatus } = await import(
      "@/lib/users/user-mutations"
    );

    await updateUserActiveStatus(
      { id: "admin-1", email: "admin@example.com", role: "admin", accountStatus: "approved", requestedRole: null },
      "507f1f77bcf86cd799439011",
      false,
    );

    expect(deleteSessionsForUserMock).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
    );
  });

  it("does not delete sessions when reactivating a user", async () => {
    findUserByIdMock.mockResolvedValue({
      _id: { toString: () => "user-2" },
      role: "client",
      isActive: false,
    });

    const { updateUserActiveStatus } = await import(
      "@/lib/users/user-mutations"
    );

    await updateUserActiveStatus(
      { id: "admin-1", email: "admin@example.com", role: "admin", accountStatus: "approved", requestedRole: null },
      "507f1f77bcf86cd799439011",
      true,
    );

    expect(deleteSessionsForUserMock).not.toHaveBeenCalled();
  });
});
