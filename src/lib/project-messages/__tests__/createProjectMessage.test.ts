import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";

const createMock = vi.fn();
const findByIdMock = vi.fn();
const createMessageNotificationMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/ProjectMessage", () => ({
  default: {
    create: createMock,
  },
}));

vi.mock("@/models/Project", () => ({
  default: {
    findById: findByIdMock,
  },
}));

vi.mock("@/lib/notifications/createMessageNotification", () => ({
  createMessageNotification: createMessageNotificationMock,
}));

const projectId = "507f1f77bcf86cd799439013";
const ownerId = "507f1f77bcf86cd799439012";
const adminId = "507f1f77bcf86cd799439011";
const messageId = "507f1f77bcf86cd799439015";

describe("createProjectMessage", () => {
  beforeEach(() => {
    createMock.mockReset();
    findByIdMock.mockReset();
    createMessageNotificationMock.mockReset();

    findByIdMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: new Types.ObjectId(projectId),
        ownerUserId: new Types.ObjectId(ownerId),
        name: "Villa",
        reviewHistory: [{ action: "submitted" }],
      }),
    });

    createMock.mockResolvedValue({
      _id: new Types.ObjectId(messageId),
    });
  });

  it("creates professional message with admin audience and seeds sender read", async () => {
    const { createProjectMessage } = await import(
      "@/lib/project-messages/createProjectMessage"
    );

    await createProjectMessage(ownerId, "professional", projectId, "שלום");

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: expect.any(Types.ObjectId),
        senderUserId: new Types.ObjectId(ownerId),
        senderRole: "professional",
        audience: "admin",
        body: "שלום",
        readByUserIds: [new Types.ObjectId(ownerId)],
      }),
    );
    expect(createMessageNotificationMock).not.toHaveBeenCalled();
  });

  it("creates admin message with professional audience and notification", async () => {
    const { createProjectMessage } = await import(
      "@/lib/project-messages/createProjectMessage"
    );

    await createProjectMessage(adminId, "admin", projectId, "עדכון");

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        senderRole: "admin",
        audience: "professional",
        body: "עדכון",
        readByUserIds: [new Types.ObjectId(adminId)],
      }),
    );
    expect(createMessageNotificationMock).toHaveBeenCalledWith({
      recipientUserId: ownerId,
      projectId,
      messageId,
      projectNameSnapshot: "Villa",
      body: "עדכון",
    });
  });

  it("does not mutate Project document", async () => {
    const { createProjectMessage } = await import(
      "@/lib/project-messages/createProjectMessage"
    );

    await createProjectMessage(ownerId, "professional", projectId, "test");

    expect(findByIdMock).toHaveBeenCalled();
    expect(findByIdMock.mock.results[0]?.value?.updateOne).toBeUndefined();
  });
});
