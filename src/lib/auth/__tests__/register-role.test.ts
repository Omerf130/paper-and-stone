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

describe("createRegisteredUser role assignment", () => {
  it("creates client users with requestedRole null", async () => {
    createMock.mockReset();
    createMock.mockResolvedValue({
      _id: { toString: () => "user-id" },
      email: "user@example.com",
      role: "client",
      requestedRole: null,
    });

    const { createRegisteredUser } = await import("@/lib/auth/user-service");

    await createRegisteredUser({
      email: "user@example.com",
      password: "password123",
      fullName: "ישראל ישראלי",
      identificationNumber: "123456789",
      userType: "client",
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@example.com",
        role: "client",
        requestedRole: null,
        accountStatus: "pending",
        fullName: "ישראל ישראלי",
        identificationNumber: "123456789",
        isActive: true,
      }),
    );

    const createArgs = createMock.mock.calls[0]?.[0] as {
      passwordHash: string;
      role: string;
      requestedRole: string | null;
    };

    expect(createArgs.role).toBe("client");
    expect(createArgs.requestedRole).toBeNull();
    expect(createArgs.passwordHash).not.toBe("password123");
  });

  it("creates architect applicants as clients with requestedRole architect", async () => {
    createMock.mockReset();
    createMock.mockResolvedValue({
      _id: { toString: () => "user-id" },
      email: "architect@example.com",
      role: "client",
      requestedRole: "architect",
    });

    const { createRegisteredUser } = await import("@/lib/auth/user-service");

    await createRegisteredUser({
      email: "architect@example.com",
      password: "password123",
      fullName: "אדריכלית לדוגמה",
      identificationNumber: "987654321",
      userType: "architect",
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "client",
        requestedRole: "architect",
        accountStatus: "pending",
      }),
    );
  });
});

describe("registerSchema", () => {
  it("rejects admin userType", async () => {
    const { registerSchema } = await import("@/lib/auth/validation");

    const parsed = registerSchema.safeParse({
      fullName: "Test User",
      email: "user@example.com",
      password: "password123",
      passwordConfirm: "password123",
      identificationNumber: "123456789",
      userType: "admin",
    });

    expect(parsed.success).toBe(false);
  });

  it("validates identity fields", async () => {
    const { registerSchema } = await import("@/lib/auth/validation");

    const parsed = registerSchema.safeParse({
      fullName: "  ",
      email: "user@example.com",
      password: "password123",
      passwordConfirm: "password123",
      identificationNumber: "12",
      userType: "client",
    });

    expect(parsed.success).toBe(false);
  });
});
