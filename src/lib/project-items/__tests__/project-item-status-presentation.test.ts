import { describe, expect, it } from "vitest";
import { getProjectItemStatusPresentation } from "@/lib/project-items/project-item-status-presentation";
import { PROJECT_ITEM_STATUSES } from "@/types/project-item-status";

describe("project-item-status-presentation", () => {
  it("maps every status to a Hebrew label and tone", () => {
    for (const status of PROJECT_ITEM_STATUSES) {
      const presentation = getProjectItemStatusPresentation(status, "admin");
      expect(presentation.label.length).toBeGreaterThan(0);
      expect(presentation.tone).toBeTruthy();
    }
  });

  it("uses client-safe labels for internal statuses", () => {
    expect(getProjectItemStatusPresentation("internal_review", "client").label).toBe(
      "בתהליך",
    );
    expect(getProjectItemStatusPresentation("hidden", "client").label).toBe("בתהליך");
  });

  it("uses updated client-facing labels", () => {
    expect(getProjectItemStatusPresentation("client_approved", "client").label).toBe(
      "אושר על ידך",
    );
    expect(getProjectItemStatusPresentation("client_rejected", "client").label).toBe(
      "נדחה על ידך",
    );
    expect(getProjectItemStatusPresentation("resubmit", "client").label).toBe("בטיפול");
  });
});
