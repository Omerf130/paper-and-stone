import { describe, expect, it } from "vitest";
import { buildWorkflowNotificationIdempotencyKey } from "@/lib/notifications/notification-idempotency";
import { buildBodyPreview } from "@/lib/notifications/notification-preview";
import { buildNotificationTitle } from "@/lib/notifications/notification-titles";
import { formatBadgeCount } from "@/lib/notifications/formatBadgeCount";

describe("notification helpers", () => {
  it("builds deterministic idempotency keys", () => {
    expect(
      buildWorkflowNotificationIdempotencyKey({
        projectId: "507f1f77bcf86cd799439013",
        reviewHistoryId: "507f1f77bcf86cd799439014",
        recipientUserId: "507f1f77bcf86cd799439011",
        type: "PROJECT_APPROVED",
      }),
    ).toBe(
      "project:507f1f77bcf86cd799439013:review:507f1f77bcf86cd799439014:recipient:507f1f77bcf86cd799439011:type:PROJECT_APPROVED",
    );
  });

  it("derives Hebrew titles from type and project snapshot", () => {
    expect(buildNotificationTitle("PROJECT_APPROVED", "וילה")).toBe(
      "הפרויקט וילה אושר",
    );
    expect(buildNotificationTitle("PROJECT_REJECTED", "וילה")).toBe(
      "הפרויקט וילה נדחה",
    );
  });

  it("truncates body previews", () => {
    const preview = buildBodyPreview("a".repeat(250));
    expect(preview).toHaveLength(200);
    expect(preview?.endsWith("…")).toBe(true);
  });

  it("caps badge display at 99+", () => {
    expect(formatBadgeCount(3)).toBe("3");
    expect(formatBadgeCount(100)).toBe("99+");
  });
});
