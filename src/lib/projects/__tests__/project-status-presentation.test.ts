import { describe, expect, it } from "vitest";
import { getAdminProjectPrimaryAttentionLabel } from "@/lib/projects/project-status-presentation";

describe("getAdminProjectPrimaryAttentionLabel", () => {
  it("returns the highest-priority attention reason only", () => {
    expect(
      getAdminProjectPrimaryAttentionLabel([
        "stale_client_prices",
        "commercial_review",
        "pending_onboarding",
      ]),
    ).toBe("ממתין לאישור פתיחה");
  });

  it("returns null when there are no reasons", () => {
    expect(getAdminProjectPrimaryAttentionLabel([])).toBeNull();
  });
});
