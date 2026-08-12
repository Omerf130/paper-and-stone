import { describe, expect, it } from "vitest";
import {
  getDisplayName,
  getProfileCompletenessSummary,
  toProfileFormInput,
} from "@/lib/professionals/profile-completeness";
import type { ProfessionalProfileView } from "@/types/professional-profile";

const baseProfile: ProfessionalProfileView = {
  id: "profile-1",
  userId: "user-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("profile-completeness", () => {
  it("reports incomplete profile with missing fields", () => {
    const summary = getProfileCompletenessSummary({
      ...baseProfile,
      fullName: "דנה לוי",
    });

    expect(summary.filledCount).toBe(1);
    expect(summary.totalCount).toBe(5);
    expect(summary.isComplete).toBe(false);
    expect(summary.missingFields).toContain("טלפון");
  });

  it("reports complete profile when all fields are filled", () => {
    const summary = getProfileCompletenessSummary({
      ...baseProfile,
      fullName: "דנה לוי",
      phone: "050-1234567",
      companyName: "סטודיו לוי",
      city: "תל אביב",
      bio: "מעצבת פנים",
    });

    expect(summary.isComplete).toBe(true);
    expect(summary.missingFields).toEqual([]);
  });

  it("uses fullName for display when present", () => {
    expect(
      getDisplayName({ fullName: "דנה לוי" }, "pro@example.com"),
    ).toBe("דנה לוי");
  });

  it("falls back to email when fullName is missing", () => {
    expect(getDisplayName({}, "pro@example.com")).toBe("pro@example.com");
  });

  it("maps profile view to form input with empty strings", () => {
    expect(
      toProfileFormInput({
        ...baseProfile,
        fullName: "דנה לוי",
      }),
    ).toEqual({
      fullName: "דנה לוי",
      phone: "",
      companyName: "",
      city: "",
      bio: "",
    });
  });
});
