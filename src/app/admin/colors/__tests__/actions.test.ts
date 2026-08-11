import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/authorization", () => ({
  requireAdmin: vi.fn(() => {
    throw new Error("redirect");
  }),
}));

describe("admin color actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires admin before create", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    const { createColorAction } = await import("@/app/admin/colors/actions");

    await expect(
      createColorAction({
        nameHe: "ירוק",
        nameEn: "",
        code: "",
        hex: "#163F35",
        sortOrder: "0",
        isActive: true,
      }),
    ).rejects.toThrow("redirect");

    expect(requireAdmin).toHaveBeenCalled();
  });
});
