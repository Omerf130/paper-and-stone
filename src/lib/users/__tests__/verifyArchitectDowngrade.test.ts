import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserMutationError } from "@/lib/users/user-errors";

const { countOwnedProjectsMock } = vi.hoisted(() => ({
  countOwnedProjectsMock: vi.fn(),
}));

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    countDocuments: countOwnedProjectsMock,
  },
}));

describe("verifyArchitectDowngradeSafety", () => {
  beforeEach(() => {
    countOwnedProjectsMock.mockReset();
  });

  it("allows non-architect downgrades", async () => {
    const { verifyArchitectDowngradeSafety } = await import(
      "@/lib/users/verifyArchitectDowngrade"
    );

    await expect(
      verifyArchitectDowngradeSafety("user-id", "client", "admin"),
    ).resolves.toBeUndefined();
    expect(countOwnedProjectsMock).not.toHaveBeenCalled();
  });

  it("blocks architect to client when projects are owned", async () => {
    countOwnedProjectsMock.mockResolvedValue(1);

    const { verifyArchitectDowngradeSafety } = await import(
      "@/lib/users/verifyArchitectDowngrade"
    );

    await expect(
      verifyArchitectDowngradeSafety(
        "507f1f77bcf86cd799439011",
        "architect",
        "client",
      ),
    ).rejects.toBeInstanceOf(UserMutationError);
  });
});
