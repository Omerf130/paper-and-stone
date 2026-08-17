import { describe, expect, it, vi, beforeEach } from "vitest";

const approveArchitectRequestMock = vi.fn();

vi.mock("@/lib/auth/authorization", () => ({
  requireAdmin: vi.fn(async () => ({
    id: "admin-id",
    email: "admin@example.com",
    role: "admin",
  })),
}));

vi.mock("@/lib/users/architect-request-mutations", () => ({
  approveArchitectRequest: approveArchitectRequestMock,
  declineArchitectRequest: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("admin architect request actions", () => {
  beforeEach(() => {
    approveArchitectRequestMock.mockReset();
  });

  it("requires admin before approving architect request", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    const { approveArchitectRequestAction } = await import(
      "@/app/admin/architect-requests/actions"
    );

    await approveArchitectRequestAction("507f1f77bcf86cd799439011");

    expect(requireAdmin).toHaveBeenCalled();
    expect(approveArchitectRequestMock).toHaveBeenCalled();
  });
});
