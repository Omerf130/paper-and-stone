import { describe, expect, it } from "vitest";
import { buildQuoteNotificationIdempotencyKey } from "@/lib/notifications/quote-notification-idempotency";
import { buildNotificationHref, buildNotificationTitle } from "@/lib/notifications/notification-titles";

describe("quote notification helpers", () => {
  it("builds deterministic quote idempotency keys", () => {
    expect(
      buildQuoteNotificationIdempotencyKey({
        projectId: "507f1f77bcf86cd799439013",
        quoteId: "507f1f77bcf86cd799439015",
        recipientUserId: "507f1f77bcf86cd799439011",
        type: "PROJECT_QUOTE_SENT",
      }),
    ).toBe(
      "project:507f1f77bcf86cd799439013:quote:507f1f77bcf86cd799439015:recipient:507f1f77bcf86cd799439011:type:PROJECT_QUOTE_SENT",
    );
  });

  it("maps quote notification title and href", () => {
    expect(buildNotificationTitle("PROJECT_QUOTE_SENT", "וילה")).toBe(
      "הצעת מחיר נשלחה לפרויקט וילה",
    );
    expect(
      buildNotificationHref(
        "PROJECT_QUOTE_SENT",
        "507f1f77bcf86cd799439013",
      ),
    ).toBe("/professional/projects/507f1f77bcf86cd799439013#project-quote");
  });
});
