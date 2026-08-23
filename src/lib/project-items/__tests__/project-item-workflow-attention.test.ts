import { describe, expect, it } from "vitest";
import {
  countClientReviewInWorkflowStatuses,
  countProjectItemsByStatus,
  getAdminWorkflowAttentionSummary,
  getArchitectWorkflowAttentionSummary,
  projectHasAdminWorkflowAttention,
} from "@/lib/project-items/project-item-workflow-attention";

describe("project-item-workflow-attention", () => {
  it("counts items by status", () => {
    const counts = countProjectItemsByStatus([
      { status: "client_review" },
      { status: "client_review" },
      { status: "client_approved" },
    ]);

    expect(counts.client_review).toBe(2);
    expect(counts.client_approved).toBe(1);
  });

  it("builds admin workflow attention summary for action-required statuses", () => {
    const summary = getAdminWorkflowAttentionSummary([
      { status: "internal_review" },
      { status: "internal_review" },
      { status: "client_rejected" },
      { status: "client_review" },
    ]);

    expect(summary.map((line) => line.status)).toEqual([
      "internal_review",
      "client_rejected",
    ]);
    expect(summary[0]?.label).toBe("2 מוצרים בבדיקה פנימית");
    expect(summary[1]?.label).toBe("מוצר אחד נדחה על ידי הלקוח");
  });

  it("detects admin workflow attention without client_review", () => {
    expect(projectHasAdminWorkflowAttention([{ status: "client_review" }])).toBe(
      false,
    );
    expect(projectHasAdminWorkflowAttention([{ status: "resubmit" }])).toBe(true);
  });

  it("splits architect workflow attention into action and informational", () => {
    const summary = getArchitectWorkflowAttentionSummary([
      { status: "client_rejected" },
      { status: "client_review" },
      { status: "client_review" },
    ]);

    expect(summary.actionRequired.map((line) => line.status)).toEqual([
      "client_rejected",
    ]);
    expect(summary.informational[0]?.label).toBe("2 מוצרים ממתינים לאישור לקוח");
  });

  it("counts client review items from workflow statuses", () => {
    expect(
      countClientReviewInWorkflowStatuses([
        { status: "client_review" },
        { status: "client_approved" },
      ]),
    ).toBe(1);
  });
});
