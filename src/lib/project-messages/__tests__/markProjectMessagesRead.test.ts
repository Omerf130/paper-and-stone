import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";
import { ADMIN_ARCHITECT_CONVERSATION_FILTER } from "@/lib/project-messages/conversation-filters";

const updateManyMock = vi.fn();
const findByIdMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/ProjectMessage", () => ({
  default: {
    updateMany: updateManyMock,
  },
}));

vi.mock("@/models/Project", () => ({
  default: {
    findById: findByIdMock,
  },
}));

const projectId = "507f1f77bcf86cd799439013";
const adminId = "507f1f77bcf86cd799439011";

describe("markProjectMessagesRead", () => {
  beforeEach(() => {
    updateManyMock.mockReset();
    findByIdMock.mockReset();
    updateManyMock.mockResolvedValue({ modifiedCount: 2 });

    findByIdMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: new Types.ObjectId(projectId),
        ownerUserId: new Types.ObjectId("507f1f77bcf86cd799439012"),
        name: "Villa",
        reviewHistory: [{ action: "submitted" }],
      }),
    });
  });

  it("marks admin-audience messages read for current admin", async () => {
    const { markProjectMessagesRead } = await import(
      "@/lib/project-messages/markProjectMessagesRead"
    );

    const count = await markProjectMessagesRead(adminId, "admin", projectId);

    expect(count).toBe(2);
    expect(updateManyMock).toHaveBeenCalledWith(
      {
        projectId: new Types.ObjectId(projectId),
        ...ADMIN_ARCHITECT_CONVERSATION_FILTER,
        audience: "admin",
        readByUserIds: { $ne: new Types.ObjectId(adminId) },
      },
      {
        $addToSet: { readByUserIds: new Types.ObjectId(adminId) },
      },
    );
  });
});
