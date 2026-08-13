import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { mergePriorityDashboardProjects } from "@/lib/professionals/getProfessionalDashboardData";
import { PROFESSIONAL_DASHBOARD_PROJECT_LIMIT } from "@/types/professional-dashboard";

function makeProject(
  id: string,
  status: "changes_requested" | "draft" | "submitted" | "approved" | "rejected",
  updatedAt: string,
) {
  return {
    _id: new Types.ObjectId(id.padStart(24, "0")),
    name: `Project ${id}`,
    clientName: "Client",
    status,
    updatedAt: new Date(updatedAt),
    items: [{ _id: new Types.ObjectId(), productId: new Types.ObjectId(), quantity: 1, snapshot: {} }],
  };
}

describe("mergePriorityDashboardProjects", () => {
  it("includes all changes_requested projects before lower priorities", () => {
    const olderChanges = makeProject("1", "changes_requested", "2026-01-01T00:00:00.000Z");
    const newerDraft = makeProject("2", "draft", "2026-02-01T00:00:00.000Z");
    const submitted = makeProject("3", "submitted", "2026-03-01T00:00:00.000Z");

    const result = mergePriorityDashboardProjects(
      {
        changesRequested: [olderChanges],
        drafts: [newerDraft],
        submitted: [submitted],
        finalized: [],
      },
      new Map(),
      PROFESSIONAL_DASHBOARD_PROJECT_LIMIT,
    );

    expect(result.map((project) => project.id)).toEqual([
      olderChanges._id.toString(),
      newerDraft._id.toString(),
      submitted._id.toString(),
    ]);
  });

  it("never excludes an older changes_requested project due to recency limits", () => {
    const staleChanges = makeProject("1", "changes_requested", "2025-01-01T00:00:00.000Z");
    const drafts = Array.from({ length: 5 }, (_, index) =>
      makeProject(String(index + 2), "draft", `2026-01-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`),
    );

    const result = mergePriorityDashboardProjects(
      {
        changesRequested: [staleChanges],
        drafts,
        submitted: [],
        finalized: [],
      },
      new Map(),
      PROFESSIONAL_DASHBOARD_PROJECT_LIMIT,
    );

    expect(result.some((project) => project.id === staleChanges._id.toString())).toBe(
      true,
    );
    expect(result[0]?.id).toBe(staleChanges._id.toString());
  });
});
