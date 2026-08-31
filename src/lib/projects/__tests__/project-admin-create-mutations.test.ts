import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";

const createMock = vi.fn();
const verifyArchitectMock = vi.fn();
const verifyClientMock = vi.fn();
const notifyMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    create: createMock,
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

const adminId = "507f1f77bcf86cd799439011";
const ownerId = "507f1f77bcf86cd799439012";
const clientId = "507f1f77bcf86cd799439014";
const projectId = "507f1f77bcf86cd799439013";

describe("project-admin-create-mutations", () => {
  beforeEach(() => {
    createMock.mockReset();
    verifyArchitectMock.mockReset();
    verifyClientMock.mockReset();
    notifyMock.mockReset();
    verifyArchitectMock.mockResolvedValue(undefined);
    verifyClientMock.mockResolvedValue(undefined);
    createMock.mockResolvedValue({
      _id: new Types.ObjectId(projectId),
      name: "Admin Project",
    });
    notifyMock.mockResolvedValue(undefined);
  });

  it("creates an active project with architect and client", async () => {
    const { createProjectAsAdmin } = await import(
      "@/lib/projects/project-admin-create-mutations"
    );

    const result = await createProjectAsAdmin(adminId, {
      ownerUserId: ownerId,
      clientUserId: clientId,
      name: "Admin Project",
      location: "Tel Aviv",
      description: "Created by admin",
    });

    expect(result).toBe(projectId);
    expect(verifyArchitectMock).toHaveBeenCalledWith(ownerId);
    expect(verifyClientMock).toHaveBeenCalledWith(clientId);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: expect.anything(),
        clientUserId: expect.anything(),
        onboardingStatus: "active",
        status: "draft",
        name: "Admin Project",
      }),
    );
    expect(notifyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientUserId: ownerId,
        type: "PROJECT_ONBOARDING_APPROVED",
      }),
    );
  });

  it("rejects invalid input ids", async () => {
    const { parseAdminCreateProjectInput } = await import(
      "@/lib/projects/project-admin-create-mutations"
    );

    const parsed = parseAdminCreateProjectInput({
      ownerUserId: "bad",
      clientUserId: clientId,
      name: "Test",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.fieldErrors.ownerUserId).toBeDefined();
    }
  });
});
