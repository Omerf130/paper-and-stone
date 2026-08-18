import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";

const findByIdMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    findById: findByIdMock,
  },
}));

const projectId = "507f1f77bcf86cd799439013";
const ownerId = "507f1f77bcf86cd799439012";
const otherProId = "507f1f77bcf86cd799439014";

function mockProject(
  reviewHistory: Array<{ action: string }> = [{ action: "submitted" }],
  onboardingStatus?: string | null,
) {
  findByIdMock.mockReturnValue({
    select: vi.fn().mockResolvedValue({
      _id: new Types.ObjectId(projectId),
      ownerUserId: new Types.ObjectId(ownerId),
      name: "Villa",
      status: "draft",
      reviewHistory,
      onboardingStatus,
    }),
  });
}

describe("verifyProjectMessagingAccess", () => {
  beforeEach(() => {
    findByIdMock.mockReset();
  });

  it("allows professional owner on submitted project", async () => {
    mockProject();

    const { verifyProjectMessagingAccess } = await import(
      "@/lib/project-messages/verifyProjectMessagingAccess"
    );

    const context = await verifyProjectMessagingAccess(
      projectId,
      "professional",
      ownerId,
    );

    expect(context.messagingAvailable).toBe(true);
    expect(context.viewerAudience).toBe("professional");
  });

  it("blocks professional on another user's project", async () => {
    mockProject();

    const { verifyProjectMessagingAccess } = await import(
      "@/lib/project-messages/verifyProjectMessagingAccess"
    );
    const { ProjectMessageMutationError } = await import(
      "@/lib/project-messages/message-errors"
    );

    await expect(
      verifyProjectMessagingAccess(projectId, "professional", otherProId),
    ).rejects.toBeInstanceOf(ProjectMessageMutationError);
  });

  it("blocks messaging on never-submitted draft", async () => {
    mockProject([]);

    const { verifyProjectMessagingAccess } = await import(
      "@/lib/project-messages/verifyProjectMessagingAccess"
    );

    const context = await verifyProjectMessagingAccess(
      projectId,
      "professional",
      ownerId,
    );

    expect(context.messagingAvailable).toBe(false);
  });

  it("allows messaging on onboarding pending project before commercial submit", async () => {
    mockProject([], "pending_approval");

    const { verifyProjectMessagingAccess } = await import(
      "@/lib/project-messages/verifyProjectMessagingAccess"
    );

    const context = await verifyProjectMessagingAccess(
      projectId,
      "professional",
      ownerId,
    );

    expect(context.messagingAvailable).toBe(true);
  });

  it("allows admin on submitted project", async () => {
    mockProject();

    const { verifyProjectMessagingAccess } = await import(
      "@/lib/project-messages/verifyProjectMessagingAccess"
    );

    const context = await verifyProjectMessagingAccess(
      projectId,
      "admin",
      "507f1f77bcf86cd799439011",
    );

    expect(context.messagingAvailable).toBe(true);
    expect(context.viewerAudience).toBe("admin");
  });
});
