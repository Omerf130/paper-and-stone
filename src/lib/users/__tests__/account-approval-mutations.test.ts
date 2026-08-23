import { describe, expect, it, vi, beforeEach } from "vitest";

const findByIdMock = vi.fn();
const updateOneMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/User", () => ({
  default: {
    findById: findByIdMock,
    updateOne: updateOneMock,
  },
}));

describe("account-approval-mutations", () => {
  beforeEach(() => {
    findByIdMock.mockReset();
    updateOneMock.mockReset();
    updateOneMock.mockResolvedValue({ matchedCount: 1 });
  });

  it("approves pending plain client registration", async () => {
    findByIdMock.mockResolvedValue({
      _id: { toString: () => "user-1" },
      role: "client",
      requestedRole: null,
      accountStatus: "pending",
      isActive: true,
    });

    const { approveClientAccount } = await import(
      "@/lib/users/account-approval-mutations"
    );

    await approveClientAccount(
      {
        id: "admin-1",
        email: "admin@example.com",
        role: "admin",
        accountStatus: "approved",
        requestedRole: null,
      },
      "507f1f77bcf86cd799439011",
    );

    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: "507f1f77bcf86cd799439011" },
      { $set: { accountStatus: "approved" } },
    );
  });

  it("rejects pending plain client registration", async () => {
    findByIdMock.mockResolvedValue({
      _id: { toString: () => "user-1" },
      role: "client",
      requestedRole: null,
      accountStatus: "pending",
      isActive: true,
    });

    const { rejectClientAccount } = await import(
      "@/lib/users/account-approval-mutations"
    );

    await rejectClientAccount(
      {
        id: "admin-1",
        email: "admin@example.com",
        role: "admin",
        accountStatus: "approved",
        requestedRole: null,
      },
      "507f1f77bcf86cd799439011",
    );

    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: "507f1f77bcf86cd799439011" },
      { $set: { accountStatus: "rejected" } },
    );
  });

  it("does not approve architect applicants from client queue", async () => {
    findByIdMock.mockResolvedValue({
      _id: { toString: () => "user-1" },
      role: "client",
      requestedRole: "architect",
      accountStatus: "pending",
      isActive: true,
    });

    const { approveClientAccount } = await import(
      "@/lib/users/account-approval-mutations"
    );

    await expect(
      approveClientAccount(
        {
          id: "admin-1",
          email: "admin@example.com",
          role: "admin",
          accountStatus: "approved",
          requestedRole: null,
        },
        "507f1f77bcf86cd799439011",
      ),
    ).rejects.toThrow("המשתמש אינו ממתין לאישור הרשמת לקוח.");
  });
});
