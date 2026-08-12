import { describe, expect, it, vi, beforeEach } from "vitest";

const updateOneMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    updateOne: updateOneMock,
  },
}));

describe("project-admin-mutations", () => {
  beforeEach(() => {
    updateOneMock.mockReset();
    updateOneMock.mockResolvedValue({ matchedCount: 1 });
  });

  it("approves submitted project with optional note", async () => {
    const { approveProject } = await import("@/lib/projects/project-admin-mutations");

    await approveProject(
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439013",
      "נראה מצוין",
    );

    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: expect.anything(), status: "submitted" },
      expect.objectContaining({
        $set: expect.objectContaining({
          status: "approved",
          reviewedAt: expect.any(Date),
          reviewedByUserId: expect.anything(),
        }),
        $push: expect.objectContaining({
          reviewHistory: expect.objectContaining({
            action: "approved",
            message: "נראה מצוין",
          }),
        }),
      }),
    );
  });

  it("requests changes with required message", async () => {
    const { requestProjectChanges } = await import(
      "@/lib/projects/project-admin-mutations"
    );

    await requestProjectChanges(
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439013",
      "עדכנו כמות",
    );

    expect(updateOneMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "submitted" }),
      expect.objectContaining({
        $set: expect.objectContaining({ status: "changes_requested" }),
        $push: expect.objectContaining({
          reviewHistory: expect.objectContaining({
            action: "changes_requested",
            message: "עדכנו כמות",
          }),
        }),
      }),
    );
  });

  it("rejects submitted project with reason", async () => {
    const { rejectProject } = await import("@/lib/projects/project-admin-mutations");

    await rejectProject(
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439013",
      "לא מתאים",
    );

    expect(updateOneMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "submitted" }),
      expect.objectContaining({
        $set: expect.objectContaining({ status: "rejected" }),
        $push: expect.objectContaining({
          reviewHistory: expect.objectContaining({
            action: "rejected",
            message: "לא מתאים",
          }),
        }),
      }),
    );
  });
});
