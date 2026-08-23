import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";
import { PROJECT_ITEM_STATUS_ERRORS } from "@/lib/project-items/project-item-workflow-validation";

const projectFindOneMock = vi.fn();
const updateOneMock = vi.fn();
const snapshotFindOneMock = vi.fn();
const workflowSettingsMock = vi.fn();

const projectId = "507f1f77bcf86cd799439011";
const itemId = "507f1f77bcf86cd799439012";
const clientUserId = "507f1f77bcf86cd799439015";

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    findOne: projectFindOneMock,
    findById: vi.fn(),
    updateOne: updateOneMock,
  },
}));

vi.mock("@/models/ClientApprovedProjectSnapshot", () => ({
  default: {
    findOne: snapshotFindOneMock,
  },
}));

vi.mock("@/lib/project-items/get-project-item-workflow-settings", () => ({
  getProjectItemWorkflowSettings: workflowSettingsMock,
}));

function mockSelectLean(value: unknown) {
  return {
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(value),
    }),
  };
}

describe("setProjectItemStatusAsClient snapshot guard", () => {
  beforeEach(() => {
    projectFindOneMock.mockReset();
    updateOneMock.mockReset();
    snapshotFindOneMock.mockReset();
    workflowSettingsMock.mockReset();
    workflowSettingsMock.mockResolvedValue({
      transitions: [
        {
          from: "client_review",
          to: "client_approved",
          allowedRoles: ["client"],
        },
      ],
    });
    updateOneMock.mockResolvedValue({ matchedCount: 1 });
  });

  it("rejects client mutation when item is not in approved snapshot", async () => {
    projectFindOneMock.mockReturnValueOnce(
      mockSelectLean({ _id: new Types.ObjectId(projectId) }),
    );
    snapshotFindOneMock.mockReturnValue(mockSelectLean(null));

    const { setProjectItemStatusAsClient } = await import(
      "@/lib/project-items/set-project-item-status"
    );

    await expect(
      setProjectItemStatusAsClient(clientUserId, {
        projectId,
        projectItemId: itemId,
        targetStatus: "client_approved",
      }),
    ).rejects.toMatchObject({
      message: PROJECT_ITEM_STATUS_ERRORS.NOT_IN_CLIENT_SNAPSHOT,
    });

    expect(updateOneMock).not.toHaveBeenCalled();
  });

  it("allows client mutation when item exists in approved snapshot", async () => {
    projectFindOneMock
      .mockReturnValueOnce(
        mockSelectLean({ _id: new Types.ObjectId(projectId) }),
      )
      .mockResolvedValueOnce({
        _id: new Types.ObjectId(projectId),
        items: [
          {
            _id: new Types.ObjectId(itemId),
            status: "client_review",
          },
        ],
      });

    snapshotFindOneMock.mockReturnValue(
      mockSelectLean({ _id: new Types.ObjectId() }),
    );

    const { setProjectItemStatusAsClient } = await import(
      "@/lib/project-items/set-project-item-status"
    );

    await setProjectItemStatusAsClient(clientUserId, {
      projectId,
      projectItemId: itemId,
      targetStatus: "client_approved",
    });

    expect(updateOneMock).toHaveBeenCalled();
  });
});
