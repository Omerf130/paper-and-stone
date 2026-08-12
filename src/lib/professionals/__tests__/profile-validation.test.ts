import { describe, expect, it } from "vitest";
import { parseProfessionalProfileFormInput } from "@/lib/professionals/profile-validation";

describe("profile-validation", () => {
  it("accepts valid profile input", () => {
    const result = parseProfessionalProfileFormInput({
      fullName: "דנה לוי",
      phone: "050-1234567",
      companyName: "סטודיו לוי",
      city: "תל אביב",
      bio: "מעצבת פנים",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        fullName: "דנה לוי",
        phone: "050-1234567",
        companyName: "סטודיו לוי",
        city: "תל אביב",
        bio: "מעצבת פנים",
      });
    }
  });

  it("trims and normalizes empty strings to undefined", () => {
    const result = parseProfessionalProfileFormInput({
      fullName: "  ",
      phone: "",
      companyName: "",
      city: "",
      bio: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({});
    }
  });

  it("rejects invalid phone characters", () => {
    const result = parseProfessionalProfileFormInput({
      phone: "abc",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.phone).toBeDefined();
    }
  });

  it("rejects fields exceeding max length", () => {
    const result = parseProfessionalProfileFormInput({
      fullName: "א".repeat(121),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.fullName).toBeDefined();
    }
  });
});
