import { describe, expect, it } from "vitest";
import {
  buildReviewHistoryEntry,
  getLatestAdminFeedback,
  hasEverBeenSubmitted,
  mapReviewHistoryEntryToView,
} from "@/lib/projects/project-review-history";

describe("project-review-history", () => {
  it("builds server-generated history entries", () => {
    const entry = buildReviewHistoryEntry({
      action: "changes_requested",
      fromStatus: "submitted",
      toStatus: "changes_requested",
      actorUserId: "507f1f77bcf86cd799439011",
      actorRole: "admin",
      message: "  עדכנו כמות  ",
    });

    expect(entry.action).toBe("changes_requested");
    expect(entry.message).toBe("עדכנו כמות");
    expect(entry.actorUserId.toString()).toBe("507f1f77bcf86cd799439011");
  });

  it("maps history entries to safe view objects", () => {
    const entry = buildReviewHistoryEntry({
      action: "submitted",
      fromStatus: "draft",
      toStatus: "submitted",
      actorUserId: "507f1f77bcf86cd799439011",
      actorRole: "professional",
    });

    const view = mapReviewHistoryEntryToView(entry);
    expect(view.actorUserId).toBe("507f1f77bcf86cd799439011");
    expect(view.createdAt).toMatch(/T/);
  });

  it("returns latest admin feedback message", () => {
    const history = [
      {
        action: "submitted" as const,
        message: undefined,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        action: "changes_requested" as const,
        message: "ראשון",
        createdAt: "2026-01-02T00:00:00.000Z",
      },
      {
        action: "resubmitted" as const,
        message: undefined,
        createdAt: "2026-01-03T00:00:00.000Z",
      },
      {
        action: "rejected" as const,
        message: "סופי",
        createdAt: "2026-01-04T00:00:00.000Z",
      },
    ];

    expect(getLatestAdminFeedback(history)?.message).toBe("סופי");
  });

  it("detects projects that were ever submitted", () => {
    expect(
      hasEverBeenSubmitted({
        reviewHistory: [{ action: "submitted" }],
      }),
    ).toBe(true);

    expect(hasEverBeenSubmitted({ reviewHistory: [] })).toBe(false);
  });
});
