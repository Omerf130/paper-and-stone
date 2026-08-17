import { describe, expect, it, vi, beforeEach } from "vitest";

const updateMock = vi.fn();

vi.mock("@/lib/auth/authorization", () => ({
  requireProfessional: vi.fn(async () => ({
    id: "507f1f77bcf86cd799439011",
    email: "pro@example.com",
    role: "architect" as const,
  })),
}));

vi.mock("@/lib/professionals/updateMyProfessionalProfile", () => ({
  updateMyProfessionalProfile: updateMock,
}));

vi.mock("@/lib/professionals/profile-validation", () => ({
  parseProfessionalProfileFormInput: vi.fn((input) => ({
    success: true,
    data: input,
  })),
  PROFILE_ERRORS: {
    GENERIC: "generic",
  },
}));

describe("professional profile actions", () => {
  beforeEach(() => {
    updateMock.mockReset();
    updateMock.mockResolvedValue(undefined);
  });

  it("derives userId from requireProfessional, not client input", async () => {
    const { requireProfessional } = await import("@/lib/auth/authorization");
    const { updateMyProfessionalProfileAction } = await import(
      "@/app/professional/profile/actions"
    );

    await updateMyProfessionalProfileAction({
      fullName: "דנה לוי",
    });

    expect(requireProfessional).toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      expect.objectContaining({ fullName: "דנה לוי" }),
    );
  });

  it("returns field errors from validation", async () => {
    const { parseProfessionalProfileFormInput } = await import(
      "@/lib/professionals/profile-validation"
    );
    vi.mocked(parseProfessionalProfileFormInput).mockReturnValueOnce({
      success: false,
      fieldErrors: { phone: "מספר טלפון אינו תקין" },
    });

    const { updateMyProfessionalProfileAction } = await import(
      "@/app/professional/profile/actions"
    );

    const result = await updateMyProfessionalProfileAction({
      phone: "abc",
    });

    expect(result.fieldErrors?.phone).toBe("מספר טלפון אינו תקין");
    expect(updateMock).not.toHaveBeenCalled();
  });
});
