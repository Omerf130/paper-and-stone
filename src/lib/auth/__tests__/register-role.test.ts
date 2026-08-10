import { describe, expect, it, vi } from "vitest";

const createMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/User", () => ({
  default: {
    create: createMock,
  },
}));

describe("createCustomerUser role assignment", () => {
  it("always creates customer users", async () => {
    createMock.mockReset();
    createMock.mockResolvedValue({
      _id: { toString: () => "user-id" },
      email: "user@example.com",
      role: "customer",
    });

    const { createCustomerUser } = await import("@/lib/auth/user-service");

    await createCustomerUser("user@example.com", "password123");

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@example.com",
        role: "customer",
        isActive: true,
      }),
    );

    const createArgs = createMock.mock.calls[0]?.[0] as {
      passwordHash: string;
      role: string;
    };

    expect(createArgs.role).toBe("customer");
    expect(createArgs.passwordHash).not.toBe("password123");
  });
});
