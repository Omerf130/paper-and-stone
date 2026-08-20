import { describe, expect, it } from "vitest";
import {
  assertAllowedTransition,
  canSubmitProject,
  getSubmitAction,
  isApprovedDirtyResubmittable,
  isInitialSubmittableStatus,
  isSubmittableStatus,
} from "@/lib/projects/project-status-transitions";
import { PROJECT_ERRORS } from "@/lib/projects/project-validation";

describe("project-status-transitions", () => {
  it("allows professional draft to submitted", () => {
    expect(() =>
      assertAllowedTransition("draft", "submitted", "professional"),
    ).not.toThrow();
  });

  it("allows professional changes_requested to submitted", () => {
    expect(() =>
      assertAllowedTransition("changes_requested", "submitted", "professional"),
    ).not.toThrow();
  });

  it("allows professional approved to submitted", () => {
    expect(() =>
      assertAllowedTransition("approved", "submitted", "professional"),
    ).not.toThrow();
  });

  it("rejects professional submitted to approved", () => {
    expect(() =>
      assertAllowedTransition("submitted", "approved", "professional"),
    ).toThrow(PROJECT_ERRORS.INVALID_TRANSITION);
  });

  it("allows admin submitted transitions", () => {
    expect(() =>
      assertAllowedTransition("submitted", "approved", "admin"),
    ).not.toThrow();
    expect(() =>
      assertAllowedTransition("submitted", "changes_requested", "admin"),
    ).not.toThrow();
    expect(() =>
      assertAllowedTransition("submitted", "rejected", "admin"),
    ).not.toThrow();
  });

  it("maps submit actions by source status", () => {
    expect(getSubmitAction("draft")).toBe("submitted");
    expect(getSubmitAction("changes_requested")).toBe("resubmitted");
    expect(getSubmitAction("approved")).toBe("resubmitted");
  });

  it("identifies initial submittable statuses", () => {
    expect(isInitialSubmittableStatus("draft")).toBe(true);
    expect(isInitialSubmittableStatus("changes_requested")).toBe(true);
    expect(isInitialSubmittableStatus("approved")).toBe(false);
    expect(isSubmittableStatus("draft")).toBe(true);
  });

  it("identifies approved dirty resubmit eligibility", () => {
    expect(
      isApprovedDirtyResubmittable({
        status: "approved",
        commercialDirty: true,
      }),
    ).toBe(true);
    expect(
      canSubmitProject({
        status: "approved",
        commercialDirty: true,
      }),
    ).toBe(true);
    expect(
      canSubmitProject({
        status: "approved",
        commercialDirty: false,
      }),
    ).toBe(false);
  });
});
