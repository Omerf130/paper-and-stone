import { describe, expect, it, vi, beforeEach } from "vitest";

const aggregateMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/ProjectMessage", () => ({
  default: {
    aggregate: aggregateMock,
  },
}));

describe("architect_client unread counts", () => {
  beforeEach(() => {
    aggregateMock.mockReset();
  });

  it("scopes architect unread counts by clientUserIdAtSend", async () => {
    aggregateMock.mockResolvedValue([
      { _id: { toString: () => "507f1f77bcf86cd799439013" }, count: 2 },
    ]);

    const { getUnreadArchitectClientMessageCountsForProjects } = await import(
      "@/lib/project-messages/getUnreadMessageCountsForProjects"
    );

    const result = await getUnreadArchitectClientMessageCountsForProjects(
      [
        {
          projectId: "507f1f77bcf86cd799439013",
          clientUserId: "507f1f77bcf86cd799439014",
        },
      ],
      "507f1f77bcf86cd799439012",
    );

    expect(result.get("507f1f77bcf86cd799439013")).toBe(2);
    expect(aggregateMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          $match: expect.objectContaining({
            conversationType: "architect_client",
            audience: "architect",
            $or: [
              expect.objectContaining({
                projectId: expect.anything(),
                clientUserIdAtSend: expect.anything(),
              }),
            ],
          }),
        }),
      ]),
    );
  });

  it("scopes client unread counts to current client assignment", async () => {
    aggregateMock.mockResolvedValue([
      { _id: { toString: () => "507f1f77bcf86cd799439013" }, count: 1 },
    ]);

    const { getUnreadClientArchitectMessageCountsForProjects } = await import(
      "@/lib/project-messages/getUnreadMessageCountsForProjects"
    );

    const result = await getUnreadClientArchitectMessageCountsForProjects(
      ["507f1f77bcf86cd799439013"],
      "507f1f77bcf86cd799439014",
    );

    expect(result.get("507f1f77bcf86cd799439013")).toBe(1);
    expect(aggregateMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          $match: expect.objectContaining({
            conversationType: "architect_client",
            audience: "client",
            clientUserIdAtSend: expect.anything(),
          }),
        }),
      ]),
    );
  });
});
