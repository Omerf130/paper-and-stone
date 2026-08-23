import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";

const updateOneMock = vi.fn();
const findByIdMock = vi.fn();
const workflowSettingsMock = vi.fn();

const projectId = "507f1f77bcf86cd799439011";
const itemId = "507f1f77bcf86cd799439012";
const adminUserId = "507f1f77bcf86cd799439013";

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    updateOne: updateOneMock,
    findById: findByIdMock,
  },
}));

vi.mock("@/lib/project-items/get-project-item-workflow-settings", () => ({
  getProjectItemWorkflowSettings: workflowSettingsMock,
}));

describe("project-item-status commercialDirty regression", () => {
  beforeEach(() => {
    updateOneMock.mockReset();
    findByIdMock.mockReset();
    workflowSettingsMock.mockReset();
    updateOneMock.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
    workflowSettingsMock.mockResolvedValue({ transitions: [] });
    findByIdMock.mockResolvedValue({
      _id: new Types.ObjectId(projectId),
      onboardingStatus: "active",
      status: "approved",
      commercialDirty: false,
      items: [
        {
          _id: new Types.ObjectId(itemId),
          status: "client_review",
          statusHistory: [],
        },
      ],
    });
  });

  it("does not set commercialDirty when only item status changes", async () => {
    const { setProjectItemStatusAsAdmin } = await import(
      "@/lib/project-items/set-project-item-status"
    );

    await setProjectItemStatusAsAdmin(adminUserId, {
      projectId,
      projectItemId: itemId,
      targetStatus: "client_approved",
    });

    const updatePayload = updateOneMock.mock.calls[0]?.[1];
    expect(updatePayload.$set).toEqual({ "items.$.status": "client_approved" });
    expect(updatePayload.$set.commercialDirty).toBeUndefined();
    expect(updatePayload.$set.commercialDirtyAt).toBeUndefined();
  });
});
