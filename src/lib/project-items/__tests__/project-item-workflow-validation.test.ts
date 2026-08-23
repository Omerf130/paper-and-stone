import { describe, expect, it } from "vitest";
import { DEFAULT_PROJECT_ITEM_WORKFLOW_TRANSITIONS } from "@/lib/project-items/project-item-workflow-defaults";
import {
  PROJECT_ITEM_STATUS_ERRORS,
  validateWorkflowTransitions,
} from "@/lib/project-items/project-item-workflow-validation";

describe("project-item-workflow-validation", () => {
  it("accepts default transitions", () => {
    expect(
      validateWorkflowTransitions(DEFAULT_PROJECT_ITEM_WORKFLOW_TRANSITIONS),
    ).toEqual({ ok: true });
  });

  it("rejects duplicate transitions", () => {
    const result = validateWorkflowTransitions([
      { from: "draft", to: "quoting", allowedRoles: ["architect"] },
      { from: "draft", to: "quoting", allowedRoles: ["client"] },
    ]);

    expect(result).toEqual({
      ok: false,
      error: PROJECT_ITEM_STATUS_ERRORS.DUPLICATE_TRANSITION,
    });
  });
});
