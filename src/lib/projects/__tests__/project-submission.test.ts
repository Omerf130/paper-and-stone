import { describe, expect, it, vi, beforeEach } from "vitest";

const updateOneMock = vi.fn();
const findOneMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    updateOne: updateOneMock,
    findOne: findOneMock,
  },
}));

vi.mock("@/lib/professionals/ensureProfessionalProfile", () => ({
  getMyProfessionalProfileView: vi.fn(async () => ({
    fullName: "דנה לוי",
    phone: "050-1234567",
  })),
}));

vi.mock("@/lib/quotes/supersedeActiveQuotes", () => ({
  supersedeActiveQuotes: vi.fn(),
}));

describe("project-submission", () => {
  beforeEach(() => {
    updateOneMock.mockReset();
    findOneMock.mockReset();
    updateOneMock.mockResolvedValue({ matchedCount: 1 });
  });

  it("submits draft project atomically with history append", async () => {
    findOneMock.mockResolvedValue({
      status: "draft",
      items: [{ _id: "item-1" }],
    });

    const { submitProject } = await import("@/lib/projects/project-submission");

    await submitProject("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439013");

    expect(updateOneMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "draft",
      }),
      expect.objectContaining({
        $set: expect.objectContaining({
          status: "submitted",
          submittedAt: expect.any(Date),
        }),
        $inc: {
          submissionRevision: 1,
        },
        $push: expect.objectContaining({
          reviewHistory: expect.objectContaining({
            action: "submitted",
          }),
        }),
      }),
    );
  });

  it("resubmits changes_requested without clearing reviewed metadata fields", async () => {
    findOneMock.mockResolvedValue({
      status: "changes_requested",
      items: [{ _id: "item-1" }],
      reviewedAt: new Date("2026-01-01"),
      reviewedByUserId: "507f1f77bcf86cd799439012",
    });

    const { submitProject } = await import("@/lib/projects/project-submission");

    await submitProject("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439013");

    const updatePayload = updateOneMock.mock.calls[0][1];
    expect(updatePayload.$set).toEqual(
      expect.objectContaining({
        status: "submitted",
        submittedAt: expect.any(Date),
      }),
    );
    expect(updatePayload.$set.reviewedAt).toBeUndefined();
    expect(updatePayload.$set.reviewedByUserId).toBeUndefined();
    expect(updatePayload.$push.reviewHistory.action).toBe("resubmitted");
  });

  it("rejects empty projects", async () => {
    findOneMock.mockResolvedValue({
      status: "draft",
      items: [],
    });

    const { submitProject } = await import("@/lib/projects/project-submission");
    const { PROJECT_ERRORS } = await import("@/lib/projects/project-validation");

    await expect(
      submitProject("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439013"),
    ).rejects.toMatchObject({
      message: PROJECT_ERRORS.EMPTY_PROJECT,
    });
  });
});
