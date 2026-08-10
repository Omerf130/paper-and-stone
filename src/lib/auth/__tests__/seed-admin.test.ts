import { describe, expect, it, vi, beforeEach } from "vitest";

const findOneMock = vi.fn();
const updateOneMock = vi.fn();
const createMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/User", () => ({
  default: {
    findOne: findOneMock,
    updateOne: updateOneMock,
    create: createMock,
  },
}));

describe("seedAdmin", () => {
  beforeEach(() => {
    findOneMock.mockReset();
    updateOneMock.mockReset();
    createMock.mockReset();
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
  });

  it("creates a new admin when none exists", async () => {
    process.env.ADMIN_EMAIL = "Admin@Example.com";
    process.env.ADMIN_PASSWORD = "admin-password";

    findOneMock.mockResolvedValue(null);
    createMock.mockResolvedValue({});

    const { seedAdmin } = await import("@/lib/auth/seed-admin");
    await seedAdmin();

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "admin@example.com",
        role: "admin",
        isActive: true,
      }),
    );

    const createArgs = createMock.mock.calls[0]?.[0] as {
      passwordHash: string;
    };
    expect(createArgs.passwordHash).not.toBe("admin-password");
    expect(updateOneMock).not.toHaveBeenCalled();
  });

  it("does not replace passwordHash for an existing admin", async () => {
    process.env.ADMIN_EMAIL = "admin@example.com";
    process.env.ADMIN_PASSWORD = "new-password";

    findOneMock.mockResolvedValue({
      email: "admin@example.com",
      passwordHash: "existing-hash",
      role: "admin",
    });

    const { seedAdmin } = await import("@/lib/auth/seed-admin");
    await seedAdmin();

    expect(updateOneMock).toHaveBeenCalledWith(
      { email: "admin@example.com" },
      { role: "admin", isActive: true },
    );
    expect(createMock).not.toHaveBeenCalled();
  });

  it("skips creation when password is missing for a new admin", async () => {
    process.env.ADMIN_EMAIL = "admin@example.com";

    findOneMock.mockResolvedValue(null);

    const { seedAdmin } = await import("@/lib/auth/seed-admin");
    await seedAdmin();

    expect(createMock).not.toHaveBeenCalled();
    expect(updateOneMock).not.toHaveBeenCalled();
  });
});
