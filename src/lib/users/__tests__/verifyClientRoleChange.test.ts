import { describe, expect, it, vi, beforeEach } from "vitest";

const countDocumentsMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    countDocuments: countDocumentsMock,
  },
}));

describe("verifyClientRoleChange", () => {
  beforeEach(() => {
    countDocumentsMock.mockReset();
  });

  it("blocks client role change when assigned to active projects", async () => {
    countDocumentsMock.mockResolvedValue(2);

    const { verifyClientRoleChangeSafety, CLIENT_ROLE_CHANGE_ERRORS } =
      await import("@/lib/users/verifyClientRoleChange");

    await expect(
      verifyClientRoleChangeSafety(
        "507f1f77bcf86cd799439011",
        "client",
        "architect",
      ),
    ).rejects.toMatchObject({
      message: CLIENT_ROLE_CHANGE_ERRORS.ASSIGNED_TO_ACTIVE_PROJECT,
    });
  });

  it("allows client role change when not assigned", async () => {
    countDocumentsMock.mockResolvedValue(0);

    const { verifyClientRoleChangeSafety } = await import(
      "@/lib/users/verifyClientRoleChange"
    );

    await expect(
      verifyClientRoleChangeSafety(
        "507f1f77bcf86cd799439011",
        "client",
        "architect",
      ),
    ).resolves.toBeUndefined();
  });
});
