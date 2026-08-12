import { describe, expect, it, vi, beforeEach } from "vitest";

const findUserByIdMock = vi.fn();
const updateOneMock = vi.fn();
const deleteSessionsForUserMock = vi.fn();
const countActiveAdminsMock = vi.fn();

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

describe("user-mutations", () => {
  beforeEach(() => {
    findUserByIdMock.mockReset();
    updateOneMock.mockReset();
    deleteSessionsForUserMock.mockReset();
    countActiveAdminsMock.mockReset();
    updateOneMock.mockResolvedValue({ matchedCount: 1 });
    countActiveAdminsMock.mockResolvedValue(2);
  });

  it("updates role with whitelisted field", async () => {
    findUserByIdMock.mockResolvedValue({
      _id: { toString: () => "user-2" },
      role: "customer",
      isActive: true,
    });

    const { updateUserRole } = await import("@/lib/users/user-mutations");

    await updateUserRole(
      { id: "admin-1", email: "admin@example.com", role: "admin" },
      "507f1f77bcf86cd799439011",
      "professional",
    );

    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: "507f1f77bcf86cd799439011" },
      { role: "professional" },
    );
  });

  it("deletes sessions when deactivating a user", async () => {
    findUserByIdMock.mockResolvedValue({
      _id: { toString: () => "user-2" },
      role: "customer",
      isActive: true,
    });

    const { updateUserActiveStatus } = await import(
      "@/lib/users/user-mutations"
    );

    await updateUserActiveStatus(
      { id: "admin-1", email: "admin@example.com", role: "admin" },
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
      role: "customer",
      isActive: false,
    });

    const { updateUserActiveStatus } = await import(
      "@/lib/users/user-mutations"
    );

    await updateUserActiveStatus(
      { id: "admin-1", email: "admin@example.com", role: "admin" },
      "507f1f77bcf86cd799439011",
      true,
    );

    expect(deleteSessionsForUserMock).not.toHaveBeenCalled();
  });
});
