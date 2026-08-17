import { describe, expect, it, vi, beforeEach } from "vitest";

const updateUserRoleMock = vi.fn();
const updateUserActiveStatusMock = vi.fn();

vi.mock("@/lib/auth/authorization", () => ({
  requireAdmin: vi.fn(async () => ({
    id: "admin-id",
    email: "admin@example.com",
    role: "admin",
  })),
}));

vi.mock("@/lib/users/user-mutations", () => ({
  updateUserRole: updateUserRoleMock,
  updateUserActiveStatus: updateUserActiveStatusMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("admin user actions", () => {
  beforeEach(() => {
    updateUserRoleMock.mockReset();
    updateUserActiveStatusMock.mockReset();
  });

  it("requires admin before role update", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    const { updateUserRoleAction } = await import("@/app/admin/users/actions");

    await updateUserRoleAction("507f1f77bcf86cd799439011", "architect");

    expect(requireAdmin).toHaveBeenCalled();
    expect(updateUserRoleMock).toHaveBeenCalled();
  });

  it("requires admin before active status update", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    const { updateUserActiveStatusAction } = await import(
      "@/app/admin/users/actions"
    );

    await updateUserActiveStatusAction("507f1f77bcf86cd799439011", false);

    expect(requireAdmin).toHaveBeenCalled();
    expect(updateUserActiveStatusMock).toHaveBeenCalled();
  });

  it("returns validation error for invalid role", async () => {
    const { updateUserRoleAction } = await import("@/app/admin/users/actions");

    const result = await updateUserRoleAction(
      "507f1f77bcf86cd799439011",
      "invalid",
    );

    expect(result.error).toBeDefined();
    expect(updateUserRoleMock).not.toHaveBeenCalled();
  });
});
