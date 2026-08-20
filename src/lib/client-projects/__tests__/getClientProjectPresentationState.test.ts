import { describe, expect, it } from "vitest";
import {
  getClientProjectPresentationState,
  isClientProjectUpdating,
} from "@/lib/client-projects/getClientProjectPresentationState";

describe("getClientProjectPresentationState", () => {
  it("returns in-progress when no snapshot exists", () => {
    const state = getClientProjectPresentationState({
      hasApprovedSnapshot: false,
      projectStatus: "pending_approval",
      commercialDirty: true,
    });

    expect(state.label).toBe("בתהליך עבודה");
    expect(state.tone).toBe("neutral");
    expect(state.isUpdating).toBe(false);
    expect(state.supportingText).toContain("פרטי המוצרים והמחירים");
  });

  it("returns unavailable state for approved projects without displayable content", async () => {
    const { getClientProjectPresentationStateWithKind } = await import(
      "@/lib/client-projects/client-project-presentation"
    );

    const state = getClientProjectPresentationStateWithKind({
      hasApprovedSnapshot: false,
      isApprovedContentUnavailable: true,
      projectStatus: "approved",
    });

    expect(state.label).toBe("הגרסה המאושרת אינה זמינה כרגע");
    expect(state.supportingText).toContain("לא ניתן להציג כרגע");
  });

  it("returns approved when snapshot is stable", () => {
    const state = getClientProjectPresentationState({
      hasApprovedSnapshot: true,
      projectStatus: "approved",
      commercialDirty: false,
      liveSubmissionRevision: 1,
      snapshotSubmissionRevision: 1,
    });

    expect(state.label).toBe("גרסה מאושרת");
    expect(state.tone).toBe("positive");
    expect(state.isUpdating).toBe(false);
  });

  it("returns updating when commercialDirty", () => {
    const state = getClientProjectPresentationState({
      hasApprovedSnapshot: true,
      projectStatus: "approved",
      commercialDirty: true,
      liveSubmissionRevision: 1,
      snapshotSubmissionRevision: 1,
    });

    expect(state.label).toBe("הפרויקט מתעדכן");
    expect(state.isUpdating).toBe(true);
  });

  it("returns updating when submitted for re-review", () => {
    const state = getClientProjectPresentationState({
      hasApprovedSnapshot: true,
      projectStatus: "submitted",
      commercialDirty: false,
      liveSubmissionRevision: 2,
      snapshotSubmissionRevision: 1,
    });

    expect(state.label).toBe("הפרויקט מתעדכן");
    expect(state.isUpdating).toBe(true);
    expect(
      isClientProjectUpdating({
        hasApprovedSnapshot: true,
        projectStatus: "submitted",
        liveSubmissionRevision: 2,
        snapshotSubmissionRevision: 1,
      }),
    ).toBe(true);
  });
});
