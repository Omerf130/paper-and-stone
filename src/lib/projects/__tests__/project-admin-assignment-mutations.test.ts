import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";

const findOneMock = vi.fn();
const updateOneMock = vi.fn();
const verifyArchitectMock = vi.fn();
const verifyClientMock = vi.fn();
const notifyMock = vi.fn();
const deleteSnapshotMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    findOne: findOneMock,
    updateOne: updateOneMock,
  },
}));

vi.mock("@/lib/admin/architects/architect-lookup-queries", () => ({
  verifyArchitectEligibleForProjectOwnership: verifyArchitectMock,
}));

vi.mock("@/lib/admin/clients/verifyClientEligibleForAssignment", () => ({
  verifyClientEligibleForAssignment: verifyClientMock,
}));

vi.mock("@/lib/notifications/createWorkflowNotification", () => ({
  createWorkflowNotification: notifyMock,
}));

vi.mock("@/lib/client-snapshots/client-approved-project-snapshot-repository", () => ({
  deleteClientApprovedProjectSnapshot: deleteSnapshotMock,
}));

const adminId = "507f1f77bcf86cd799439011";
const ownerId = "507f1f77bcf86cd799439012";
const newOwnerId = "507f1f77bcf86cd799439015";
const clientId = "507f1f77bcf86cd799439014";
const projectId = "507f1f77bcf86cd799439013";

function activeProject(status: "draft" | "approved" = "draft") {
  return {
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(ownerId),
    name: "Villa",
    status,
    onboardingStatus: "active",
    clientUserId: new Types.ObjectId(clientId),
  };
}

describe("project-admin-assignment-mutations", () => {
  beforeEach(() => {
    findOneMock.mockReset();
    updateOneMock.mockReset();
    verifyArchitectMock.mockReset();
    verifyClientMock.mockReset();
    notifyMock.mockReset();
    deleteSnapshotMock.mockReset();
    verifyArchitectMock.mockResolvedValue(undefined);
    verifyClientMock.mockResolvedValue(undefined);
    updateOneMock.mockResolvedValue({ matchedCount: 1 });
    notifyMock.mockResolvedValue(undefined);
    deleteSnapshotMock.mockResolvedValue(undefined);
  });

  it("reassigns architect and notifies both parties", async () => {
    findOneMock.mockResolvedValue(activeProject());

    const { reassignProjectArchitect } = await import(
      "@/lib/projects/project-admin-assignment-mutations"
    );

    await reassignProjectArchitect(adminId, projectId, newOwnerId);

    expect(verifyArchitectMock).toHaveBeenCalledWith(newOwnerId);
    expect(updateOneMock).toHaveBeenCalledWith(
      expect.objectContaining({ _id: expect.anything() }),
      expect.objectContaining({
        $set: { ownerUserId: expect.anything() },
        $push: expect.objectContaining({
          reviewHistory: expect.objectContaining({
            action: "onboarding_architect_reassigned",
          }),
        }),
      }),
    );
    expect(notifyMock).toHaveBeenCalledTimes(2);
  });

  it("rejects reassigning to the same architect", async () => {
    findOneMock.mockResolvedValue(activeProject());

    const { reassignProjectArchitect } = await import(
      "@/lib/projects/project-admin-assignment-mutations"
    );
    const { ProjectMutationError } = await import("@/lib/projects/project-errors");
    const { CRM_ERRORS } = await import("@/types/admin-crm");

    await expect(
      reassignProjectArchitect(adminId, projectId, ownerId),
    ).rejects.toThrow(ProjectMutationError);

    await expect(
      reassignProjectArchitect(adminId, projectId, ownerId),
    ).rejects.toMatchObject({ message: CRM_ERRORS.SAME_ARCHITECT });
  });

  it("reassigns client and marks approved projects commercial dirty", async () => {
    findOneMock.mockResolvedValue(activeProject("approved"));

    const { reassignProjectClientAsAdmin } = await import(
      "@/lib/projects/project-admin-assignment-mutations"
    );

    await reassignProjectClientAsAdmin(adminId, projectId, clientId);

    expect(verifyClientMock).toHaveBeenCalledWith(clientId);
    expect(deleteSnapshotMock).toHaveBeenCalledWith(projectId);
    expect(updateOneMock).toHaveBeenCalledTimes(2);
    expect(updateOneMock).toHaveBeenLastCalledWith(
      { _id: expect.anything() },
      {
        $set: {
          commercialDirty: true,
          commercialDirtyAt: expect.any(Date),
        },
      },
    );
  });
});
