import { describe, expect, it, vi, beforeEach } from "vitest";

const updateOneMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Notification", () => ({
  default: {
    updateOne: updateOneMock,
  },
}));

describe("createMessageNotification", () => {
  beforeEach(() => {
    updateOneMock.mockReset();
    updateOneMock.mockResolvedValue({ upsertedCount: 1 });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("upserts PROJECT_MESSAGE notification with idempotency key", async () => {
    const { createMessageNotification } = await import(
      "@/lib/notifications/createMessageNotification"
    );

    await createMessageNotification({
      recipientUserId: "507f1f77bcf86cd799439012",
      projectId: "507f1f77bcf86cd799439013",
      messageId: "507f1f77bcf86cd799439015",
      projectNameSnapshot: "Villa",
      body: "הודעה חדשה",
    });

    expect(updateOneMock).toHaveBeenCalledWith(
      {
        idempotencyKey:
          "project:507f1f77bcf86cd799439013:message:507f1f77bcf86cd799439015:recipient:507f1f77bcf86cd799439012",
      },
      expect.objectContaining({
        $setOnInsert: expect.objectContaining({
          type: "PROJECT_MESSAGE",
          projectNameSnapshot: "Villa",
          bodyPreview: "הודעה חדשה",
          isRead: false,
        }),
      }),
      { upsert: true },
    );
  });

  it("logs and swallows insert failures", async () => {
    updateOneMock.mockRejectedValueOnce(new Error("db down"));

    const { createMessageNotification } = await import(
      "@/lib/notifications/createMessageNotification"
    );

    await expect(
      createMessageNotification({
        recipientUserId: "507f1f77bcf86cd799439012",
        projectId: "507f1f77bcf86cd799439013",
        messageId: "507f1f77bcf86cd799439015",
        projectNameSnapshot: "Villa",
        body: "test",
      }),
    ).resolves.toBeUndefined();

    expect(console.error).toHaveBeenCalled();
  });
});
