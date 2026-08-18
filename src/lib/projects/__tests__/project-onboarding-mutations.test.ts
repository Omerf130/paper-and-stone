import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";

const findOneMock = vi.fn();
const updateOneMock = vi.fn();
const verifyClientMock = vi.fn();
const notifyMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    findOne: findOneMock,
    updateOne: updateOneMock,
  },
}));

vi.mock("@/lib/admin/clients/verifyClientEligibleForAssignment", () => ({
  verifyClientEligibleForAssignment: verifyClientMock,
}));

vi.mock("@/lib/notifications/createWorkflowNotification", () => ({
  createWorkflowNotification: notifyMock,
}));

const adminId = "507f1f77bcf86cd799439011";
const ownerId = "507f1f77bcf86cd799439012";
const clientId = "507f1f77bcf86cd799439014";
const projectId = "507f1f77bcf86cd799439013";

function pendingProject() {
  return {
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(ownerId),
    name: "Villa",
    status: "draft",
    onboardingStatus: "pending_approval",
    clientUserId: null,
  };
}

describe("project-onboarding-mutations", () => {
  beforeEach(() => {
    findOneMock.mockReset();
    updateOneMock.mockReset();
    verifyClientMock.mockReset();
    notifyMock.mockReset();
    verifyClientMock.mockResolvedValue(undefined);
    updateOneMock.mockResolvedValue({ matchedCount: 1 });
  });

  it("approves pending onboarding with client assignment", async () => {
    findOneMock.mockResolvedValue(pendingProject());

    const { approveProjectOnboarding } = await import(
      "@/lib/projects/project-onboarding-mutations"
    );

    await approveProjectOnboarding(adminId, projectId, clientId);

    expect(verifyClientMock).toHaveBeenCalledWith(clientId);
    expect(updateOneMock).toHaveBeenCalledWith(
      expect.objectContaining({
        onboardingStatus: "pending_approval",
      }),
      expect.objectContaining({
        $set: expect.objectContaining({
          onboardingStatus: "active",
          clientUserId: expect.anything(),
        }),
        $push: expect.objectContaining({
          reviewHistory: expect.objectContaining({
            action: "onboarding_approved",
          }),
        }),
      }),
    );
    expect(notifyMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "PROJECT_ONBOARDING_APPROVED" }),
    );
  });

  it("rejects pending onboarding with optional reason", async () => {
    findOneMock.mockResolvedValue(pendingProject());

    const { rejectProjectOnboarding } = await import(
      "@/lib/projects/project-onboarding-mutations"
    );

    await rejectProjectOnboarding(adminId, projectId, "Missing details");

    expect(updateOneMock).toHaveBeenCalledWith(
      expect.objectContaining({ onboardingStatus: "pending_approval" }),
      expect.objectContaining({
        $set: { onboardingStatus: "rejected" },
        $push: expect.objectContaining({
          reviewHistory: expect.objectContaining({
            action: "onboarding_rejected",
            message: "Missing details",
          }),
        }),
      }),
    );
  });

  it("resubmits rejected onboarding back to pending", async () => {
    findOneMock.mockResolvedValue({
      ...pendingProject(),
      onboardingStatus: "rejected",
    });

    const { resubmitProjectOnboarding } = await import(
      "@/lib/projects/project-onboarding-mutations"
    );

    await resubmitProjectOnboarding(ownerId, projectId);

    expect(updateOneMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: expect.anything(),
        onboardingStatus: "rejected",
      }),
      expect.objectContaining({
        $set: { onboardingStatus: "pending_approval" },
      }),
    );
  });

  it("reassigns client on active onboarding project", async () => {
    findOneMock.mockResolvedValue({
      ...pendingProject(),
      onboardingStatus: "active",
      clientUserId: new Types.ObjectId(clientId),
    });

    const newClientId = "507f1f77bcf86cd799439015";
    const { reassignProjectClient } = await import(
      "@/lib/projects/project-onboarding-mutations"
    );

    await reassignProjectClient(adminId, projectId, newClientId);

    expect(updateOneMock).toHaveBeenCalledWith(
      expect.objectContaining({ onboardingStatus: "active" }),
      expect.objectContaining({
        $set: expect.objectContaining({
          clientUserId: expect.anything(),
        }),
      }),
    );
  });
});
