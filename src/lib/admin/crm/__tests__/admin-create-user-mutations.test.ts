import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";

const userCreateMock = vi.fn();
const profileUpdateMock = vi.fn();
const emailExistsMock = vi.fn();
const hashPasswordMock = vi.fn();
const ensureProfileMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/User", () => ({
  default: {
    create: userCreateMock,
  },
}));

vi.mock("@/models/ProfessionalProfile", () => ({
  default: {
    updateOne: profileUpdateMock,
  },
}));

vi.mock("@/lib/auth/user-service", () => ({
  emailExists: emailExistsMock,
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: hashPasswordMock,
}));

vi.mock("@/lib/professionals/ensureProfessionalProfile", () => ({
  ensureProfessionalProfile: ensureProfileMock,
}));

const userId = "507f1f77bcf86cd799439012";

const validInput = {
  fullName: "Test User",
  email: "test@example.com",
  identificationNumber: "123456789",
  initialPassword: "password123",
  initialPasswordConfirm: "password123",
};

describe("admin-create-user-mutations", () => {
  beforeEach(() => {
    userCreateMock.mockReset();
    profileUpdateMock.mockReset();
    emailExistsMock.mockReset();
    hashPasswordMock.mockReset();
    ensureProfileMock.mockReset();
    emailExistsMock.mockResolvedValue(false);
    hashPasswordMock.mockResolvedValue("hashed-password");
    userCreateMock.mockResolvedValue({
      _id: new Types.ObjectId(userId),
    });
    profileUpdateMock.mockResolvedValue({ modifiedCount: 1 });
    ensureProfileMock.mockResolvedValue(undefined);
  });

  it("creates client with admin-provided password hash", async () => {
    const { createClientAsAdmin } = await import(
      "@/lib/admin/crm/admin-create-user-mutations"
    );

    const result = await createClientAsAdmin(validInput);

    expect(result).toBe(userId);
    expect(hashPasswordMock).toHaveBeenCalledWith("password123");
    expect(userCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@example.com",
        passwordHash: "hashed-password",
        role: "client",
        accountStatus: "approved",
        isActive: true,
      }),
    );
  });

  it("creates architect with professional profile bootstrap", async () => {
    const { createArchitectAsAdmin } = await import(
      "@/lib/admin/crm/admin-create-user-mutations"
    );

    const result = await createArchitectAsAdmin(validInput);

    expect(result).toBe(userId);
    expect(ensureProfileMock).toHaveBeenCalledWith(userId);
    expect(profileUpdateMock).toHaveBeenCalledWith(
      { userId: expect.anything() },
      { $set: { fullName: "Test User" } },
    );
  });

  it("rejects duplicate email", async () => {
    emailExistsMock.mockResolvedValue(true);

    const { createClientAsAdmin } = await import(
      "@/lib/admin/crm/admin-create-user-mutations"
    );
    const { UserMutationError } = await import("@/lib/users/user-errors");
    const { CRM_ERRORS } = await import("@/types/admin-crm");

    await expect(createClientAsAdmin(validInput)).rejects.toMatchObject({
      message: CRM_ERRORS.EMAIL_EXISTS,
    });
    await expect(createClientAsAdmin(validInput)).rejects.toBeInstanceOf(
      UserMutationError,
    );
  });
});

describe("admin-create-user-validation", () => {
  it("requires matching password confirmation", async () => {
    const { parseAdminCreateUserInput } = await import(
      "@/lib/admin/crm/admin-create-user-validation"
    );

    const parsed = parseAdminCreateUserInput({
      ...validInput,
      initialPasswordConfirm: "different",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.fieldErrors.initialPasswordConfirm).toBeDefined();
    }
  });
});
