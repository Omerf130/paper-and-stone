import { describe, expect, it, vi, beforeEach } from "vitest";

const countDocumentsMock = vi.fn();
const findMock = vi.fn();
const updateOneMock = vi.fn();
const updateManyMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Notification", () => ({
  default: {
    countDocuments: countDocumentsMock,
    find: findMock,
    updateOne: updateOneMock,
    updateMany: updateManyMock,
  },
}));

describe("notification-queries", () => {
  beforeEach(() => {
    countDocumentsMock.mockReset();
    findMock.mockReset();
    updateOneMock.mockReset();
    updateManyMock.mockReset();
  });

  it("counts unread notifications for recipient", async () => {
    countDocumentsMock.mockResolvedValue(4);

    const { getUnreadNotificationCount } = await import(
      "@/lib/notifications/notification-queries"
    );

    const count = await getUnreadNotificationCount("507f1f77bcf86cd799439011");

    expect(count).toBe(4);
    expect(countDocumentsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientUserId: expect.anything(),
        isRead: false,
      }),
    );
  });

  it("marks notification read only for owner recipient", async () => {
    updateOneMock.mockResolvedValue({ modifiedCount: 1 });

    const { markNotificationRead } = await import(
      "@/lib/notifications/notification-queries"
    );

    const updated = await markNotificationRead(
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439013",
    );

    expect(updated).toBe(true);
    expect(updateOneMock).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientUserId: expect.anything(),
        isRead: false,
      }),
      expect.objectContaining({
        $set: expect.objectContaining({ isRead: true }),
      }),
    );
  });

  it("marks all unread notifications for recipient", async () => {
    updateManyMock.mockResolvedValue({ modifiedCount: 2 });

    const { markAllNotificationsRead } = await import(
      "@/lib/notifications/notification-queries"
    );

    const count = await markAllNotificationsRead("507f1f77bcf86cd799439011");

    expect(count).toBe(2);
    expect(updateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientUserId: expect.anything(),
        isRead: false,
      }),
      expect.objectContaining({
        $set: expect.objectContaining({ isRead: true }),
      }),
    );
  });
});
