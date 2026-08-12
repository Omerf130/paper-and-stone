import { describe, expect, it, vi, beforeEach } from "vitest";

const createProjectMessageMock = vi.fn();
const revalidatePathMock = vi.fn();
const revalidateProfessionalNotificationSurfacesMock = vi.fn();

vi.mock("@/lib/auth/authorization", () => ({
  requireAdmin: vi.fn(async () => ({
    id: "507f1f77bcf86cd799439011",
    email: "admin@example.com",
    role: "admin",
  })),
}));

vi.mock("@/lib/project-messages/createProjectMessage", () => ({
  createProjectMessage: createProjectMessageMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/notifications/revalidate-professional-notification-surfaces", () => ({
  revalidateProfessionalNotificationSurfaces:
    revalidateProfessionalNotificationSurfacesMock,
}));

const projectId = "507f1f77bcf86cd799439013";

describe("admin project message actions", () => {
  beforeEach(() => {
    createProjectMessageMock.mockReset();
    revalidatePathMock.mockReset();
    revalidateProfessionalNotificationSurfacesMock.mockReset();
    createProjectMessageMock.mockResolvedValue({
      messageId: "507f1f77bcf86cd799439015",
      projectId,
      ownerUserId: "507f1f77bcf86cd799439012",
      projectName: "Villa",
    });
  });

  it("revalidates professional notification surfaces after admin send", async () => {
    const { sendAdminProjectMessageAction } = await import(
      "@/app/admin/projects/message-actions"
    );

    const result = await sendAdminProjectMessageAction(projectId, "שלום");

    expect(result).toEqual({ success: true });
    expect(createProjectMessageMock).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      "admin",
      projectId,
      "שלום",
    );
    expect(revalidateProfessionalNotificationSurfacesMock).toHaveBeenCalledTimes(
      1,
    );
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/admin/projects/${projectId}`,
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/projects");
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/professional/projects/${projectId}`,
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/professional/projects");
  });
});
