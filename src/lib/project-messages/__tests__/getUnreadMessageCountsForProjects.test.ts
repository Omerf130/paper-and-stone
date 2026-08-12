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

describe("getUnreadMessageCountsForProjects", () => {
  beforeEach(() => {
    aggregateMock.mockReset();
  });

  it("returns empty map for no project ids", async () => {
    const { getUnreadMessageCountsForProjects } = await import(
      "@/lib/project-messages/getUnreadMessageCountsForProjects"
    );

    const result = await getUnreadMessageCountsForProjects(
      [],
      "507f1f77bcf86cd799439011",
      "admin",
    );

    expect(result.size).toBe(0);
    expect(aggregateMock).not.toHaveBeenCalled();
  });

  it("groups unread counts by projectId for admin audience", async () => {
    aggregateMock.mockResolvedValue([
      { _id: { toString: () => "507f1f77bcf86cd799439013" }, count: 3 },
    ]);

    const { getUnreadMessageCountsForProjects } = await import(
      "@/lib/project-messages/getUnreadMessageCountsForProjects"
    );

    const result = await getUnreadMessageCountsForProjects(
      ["507f1f77bcf86cd799439013"],
      "507f1f77bcf86cd799439011",
      "admin",
    );

    expect(result.get("507f1f77bcf86cd799439013")).toBe(3);
    expect(aggregateMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          $match: expect.objectContaining({
            audience: "admin",
          }),
        }),
      ]),
    );
  });
});
