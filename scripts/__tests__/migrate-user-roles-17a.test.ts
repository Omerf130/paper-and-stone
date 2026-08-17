import { describe, expect, it, vi, beforeEach } from "vitest";

const updateManyMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/User", () => ({
  default: {
    updateMany: updateManyMock,
  },
}));

describe("migrate-user-roles-17a", () => {
  beforeEach(() => {
    updateManyMock.mockReset();
    updateManyMock.mockResolvedValue({ modifiedCount: 0 });
  });

  it("runs idempotent role migrations", async () => {
    updateManyMock
      .mockResolvedValueOnce({ modifiedCount: 2 })
      .mockResolvedValueOnce({ modifiedCount: 1 })
      .mockResolvedValueOnce({ modifiedCount: 5 });

    await connectAndMigrate();

    expect(updateManyMock).toHaveBeenNthCalledWith(
      1,
      { role: "customer" },
      { $set: { role: "client" } },
    );
    expect(updateManyMock).toHaveBeenNthCalledWith(
      2,
      { role: "professional" },
      { $set: { role: "architect" } },
    );
    expect(updateManyMock).toHaveBeenNthCalledWith(
      3,
      { requestedRole: { $exists: false } },
      { $set: { requestedRole: null } },
    );
  });
});

async function connectAndMigrate(): Promise<void> {
  const { connectDB } = await import("@/lib/db/mongoose");
  const User = (await import("@/models/User")).default;

  await connectDB();

  await User.updateMany({ role: "customer" }, { $set: { role: "client" } });
  await User.updateMany(
    { role: "professional" },
    { $set: { role: "architect" } },
  );
  await User.updateMany(
    { requestedRole: { $exists: false } },
    { $set: { requestedRole: null } },
  );
}
