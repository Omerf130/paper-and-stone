import { describe, expect, it } from "vitest";
import { DEFAULT_PROJECT_ITEM_WORKFLOW_SETTINGS } from "@/lib/project-items/project-item-workflow-defaults";
import {
  canTransitionProjectItemStatus,
  getAllowedTargetStatusesForRole,
} from "@/lib/project-items/project-item-status-transition";

describe("project-item-status-transition", () => {
  const settings = DEFAULT_PROJECT_ITEM_WORKFLOW_SETTINGS;

  it("allows admin to override any status", () => {
    expect(
      canTransitionProjectItemStatus({
        role: "admin",
        from: "draft",
        to: "client_approved",
        settings,
      }),
    ).toBe(true);
  });

  it("allows architect configured transitions", () => {
    expect(
      canTransitionProjectItemStatus({
        role: "architect",
        from: "draft",
        to: "quoting",
        settings,
      }),
    ).toBe(true);
  });

  it("blocks architect forbidden transitions", () => {
    expect(
      canTransitionProjectItemStatus({
        role: "architect",
        from: "draft",
        to: "client_approved",
        settings,
      }),
    ).toBe(false);
  });

  it("allows client configured transitions", () => {
    expect(
      canTransitionProjectItemStatus({
        role: "client",
        from: "client_review",
        to: "client_approved",
        settings,
      }),
    ).toBe(true);
  });

  it("blocks client forbidden transitions", () => {
    expect(
      canTransitionProjectItemStatus({
        role: "client",
        from: "client_review",
        to: "quoting",
        settings,
      }),
    ).toBe(false);
  });

  it("rejects same-status transitions", () => {
    expect(
      canTransitionProjectItemStatus({
        role: "admin",
        from: "draft",
        to: "draft",
        settings,
      }),
    ).toBe(false);
  });

  it("returns all statuses except current for admin targets", () => {
    expect(getAllowedTargetStatusesForRole("admin", "draft", settings)).not.toContain(
      "draft",
    );
    expect(getAllowedTargetStatusesForRole("admin", "draft", settings)).toContain(
      "client_review",
    );
  });
});
