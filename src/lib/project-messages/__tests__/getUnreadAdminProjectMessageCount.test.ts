import { describe, expect, it, vi, beforeEach } from "vitest";
import { ADMIN_ARCHITECT_CONVERSATION_FILTER } from "@/lib/project-messages/conversation-filters";

const countDocumentsMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/ProjectMessage", () => ({
  default: {
    countDocuments: countDocumentsMock,
  },
}));

describe("getUnreadAdminProjectMessageCount", () => {
  beforeEach(() => {
    countDocumentsMock.mockReset();
    countDocumentsMock.mockResolvedValue(2);
  });

  it("returns zero for invalid admin user id", async () => {
    const { getUnreadAdminProjectMessageCount } = await import(
      "@/lib/project-messages/getUnreadAdminProjectMessageCount"
    );

    const count = await getUnreadAdminProjectMessageCount("invalid");

    expect(count).toBe(0);
    expect(countDocumentsMock).not.toHaveBeenCalled();
  });

  it("counts unread admin audience messages", async () => {
    const { getUnreadAdminProjectMessageCount } = await import(
      "@/lib/project-messages/getUnreadAdminProjectMessageCount"
    );

    const count = await getUnreadAdminProjectMessageCount(
      "507f1f77bcf86cd799439011",
    );

    expect(count).toBe(2);
    expect(countDocumentsMock).toHaveBeenCalledWith({
      ...ADMIN_ARCHITECT_CONVERSATION_FILTER,
      audience: "admin",
      readByUserIds: { $ne: expect.anything() },
    });
  });
});
