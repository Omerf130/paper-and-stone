import { describe, expect, it } from "vitest";
import { isProfileReadyForProjects } from "@/lib/professionals/profile-readiness";

describe("profile-readiness", () => {
  it("requires fullName and phone", () => {
    expect(
      isProfileReadyForProjects({
        fullName: "דנה לוי",
        phone: "050-1234567",
      }),
    ).toBe(true);
  });

  it("rejects incomplete profile", () => {
    expect(
      isProfileReadyForProjects({
        fullName: "דנה לוי",
      }),
    ).toBe(false);
  });
});
