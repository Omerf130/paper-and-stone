import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";
import { PROJECT_ITEM_STATUS_ERRORS } from "@/lib/project-items/project-item-workflow-validation";

const updateOneMock = vi.fn();
const findByIdMock = vi.fn();
const findOneMock = vi.fn();
const workflowSettingsMock = vi.fn();

const projectId = "507f1f77bcf86cd799439011";
const itemId = "507f1f77bcf86cd799439012";
const adminUserId = "507f1f77bcf86cd799439013";
const architectUserId = "507f1f77bcf86cd799439014";
const clientUserId = "507f1f77bcf86cd799439015";

function createProject(overrides?: {
  ownerUserId?: string;
  clientUserId?: string;
  status?: string;
  pricing?: Record<string, unknown>;
}) {
  return {
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(overrides?.ownerUserId ?? architectUserId),
    clientUserId: overrides?.clientUserId
      ? new Types.ObjectId(overrides.clientUserId)
      : new Types.ObjectId(clientUserId),
    onboardingStatus: "active",
    items: [
      {
        _id: new Types.ObjectId(itemId),
        status: overrides?.status ?? "draft",
        statusHistory: [],
        pricing: overrides?.pricing ?? {
          internalCostAgorot: 100_000,
          architectPriceAgorot: 140_000,
          clientPriceAgorot: 210_000,
          priceVersion: 1,
        },
      },
    ],
  };
}

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    updateOne: updateOneMock,
    findById: findByIdMock,
    findOne: findOneMock,
  },
}));

vi.mock("@/lib/project-items/get-project-item-workflow-settings", () => ({
  getProjectItemWorkflowSettings: workflowSettingsMock,
}));

describe("set-project-item-status", () => {
  beforeEach(() => {
    updateOneMock.mockReset();
    findByIdMock.mockReset();
    findOneMock.mockReset();
    workflowSettingsMock.mockReset();
    updateOneMock.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
    workflowSettingsMock.mockResolvedValue({
      transitions: [
        { from: "draft", to: "quoting", allowedRoles: ["architect"] },
        {
          from: "client_review",
          to: "client_approved",
          allowedRoles: ["client"],
        },
      ],
    });
  });

  it("allows admin override to any status", async () => {
    findByIdMock.mockResolvedValue(createProject());

    const { setProjectItemStatusAsAdmin } = await import(
      "@/lib/project-items/set-project-item-status"
    );

    await setProjectItemStatusAsAdmin(adminUserId, {
      projectId,
      projectItemId: itemId,
      targetStatus: "client_review",
    });

    expect(updateOneMock).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        $set: { "items.$.status": "client_review" },
        $push: {
          "items.$.statusHistory": expect.objectContaining({
            from: "draft",
            to: "client_review",
            changedByRole: "admin",
          }),
        },
      }),
    );
  });

  it("allows architect allowed transition", async () => {
    findOneMock.mockResolvedValue(createProject());

    const { setProjectItemStatusAsArchitect } = await import(
      "@/lib/project-items/set-project-item-status"
    );

    await setProjectItemStatusAsArchitect(architectUserId, {
      projectId,
      projectItemId: itemId,
      targetStatus: "quoting",
    });

    expect(updateOneMock).toHaveBeenCalled();
  });

  it("blocks architect forbidden transition", async () => {
    findOneMock.mockResolvedValue(createProject());

    const { setProjectItemStatusAsArchitect } = await import(
      "@/lib/project-items/set-project-item-status"
    );

    await expect(
      setProjectItemStatusAsArchitect(architectUserId, {
        projectId,
        projectItemId: itemId,
        targetStatus: "client_approved",
      }),
    ).rejects.toMatchObject({
      message: PROJECT_ITEM_STATUS_ERRORS.TRANSITION_NOT_ALLOWED,
    });

    expect(updateOneMock).not.toHaveBeenCalled();
  });

  it("blocks unrelated architect", async () => {
    findOneMock.mockResolvedValue(null);

    const { setProjectItemStatusAsArchitect } = await import(
      "@/lib/project-items/set-project-item-status"
    );

    await expect(
      setProjectItemStatusAsArchitect("507f1f77bcf86cd799439099", {
        projectId,
        projectItemId: itemId,
        targetStatus: "quoting",
      }),
    ).rejects.toMatchObject({
      message: PROJECT_ITEM_STATUS_ERRORS.PROJECT_NOT_FOUND,
    });
  });

  it("allows client allowed transition", async () => {
    findOneMock.mockResolvedValue(
      createProject({ status: "client_review" }),
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

  it("blocks unrelated client", async () => {
    findOneMock.mockResolvedValue(null);

    const { setProjectItemStatusAsClient } = await import(
      "@/lib/project-items/set-project-item-status"
    );

    await expect(
      setProjectItemStatusAsClient("507f1f77bcf86cd799439099", {
        projectId,
        projectItemId: itemId,
        targetStatus: "client_approved",
      }),
    ).rejects.toMatchObject({
      message: PROJECT_ITEM_STATUS_ERRORS.PROJECT_NOT_FOUND,
    });
  });

  it("does not mutate pricing on status change", async () => {
    const project = createProject({ status: "client_review" });
    findOneMock.mockResolvedValue(project);

    const { setProjectItemStatusAsClient } = await import(
      "@/lib/project-items/set-project-item-status"
    );

    await setProjectItemStatusAsClient(clientUserId, {
      projectId,
      projectItemId: itemId,
      targetStatus: "client_approved",
    });

    const updatePayload = updateOneMock.mock.calls[0]?.[1];
    expect(updatePayload.$set).toEqual({ "items.$.status": "client_approved" });
    expect(updatePayload).not.toHaveProperty("$set.internalCostAgorot");
  });
});
