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

describe("createWorkflowNotification", () => {
  beforeEach(() => {
    updateOneMock.mockReset();
    updateOneMock.mockResolvedValue({ upsertedCount: 1 });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("upserts notification with idempotency key", async () => {
    const { createWorkflowNotification } = await import(
      "@/lib/notifications/createWorkflowNotification"
    );

    await createWorkflowNotification({
      recipientUserId: "507f1f77bcf86cd799439011",
      type: "PROJECT_CHANGES_REQUESTED",
      projectId: "507f1f77bcf86cd799439013",
      reviewHistoryId: "507f1f77bcf86cd799439014",
      projectNameSnapshot: "Villa",
      message: "עדכנו כמות",
    });

    expect(updateOneMock).toHaveBeenCalledWith(
      {
        idempotencyKey:
          "project:507f1f77bcf86cd799439013:review:507f1f77bcf86cd799439014:recipient:507f1f77bcf86cd799439011:type:PROJECT_CHANGES_REQUESTED",
      },
      expect.objectContaining({
        $setOnInsert: expect.objectContaining({
          type: "PROJECT_CHANGES_REQUESTED",
          projectNameSnapshot: "Villa",
          bodyPreview: "עדכנו כמות",
          isRead: false,
        }),
      }),
      { upsert: true },
    );
  });

  it("logs and swallows insert failures", async () => {
    updateOneMock.mockRejectedValueOnce(new Error("db down"));

    const { createWorkflowNotification } = await import(
      "@/lib/notifications/createWorkflowNotification"
    );

    await expect(
      createWorkflowNotification({
        recipientUserId: "507f1f77bcf86cd799439011",
        type: "PROJECT_REJECTED",
        projectId: "507f1f77bcf86cd799439013",
        reviewHistoryId: "507f1f77bcf86cd799439014",
        projectNameSnapshot: "Villa",
      }),
    ).resolves.toBeUndefined();

    expect(console.error).toHaveBeenCalled();
  });
});
