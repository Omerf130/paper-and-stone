import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/authorization", () => ({
  requireAdmin: vi.fn(() => {
    throw new Error("redirect");
  }),
}));

vi.mock("@/lib/materials/material-mutations", () => ({
  createMaterial: vi.fn(),
  updateMaterial: vi.fn(),
  getMaterialColorIds: vi.fn(),
}));

describe("admin material actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires admin before create", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    const { createMaterialAction } = await import(
      "@/app/admin/materials/actions"
    );

    await expect(
      createMaterialAction({
        nameEn: "Velvet",
        code: "",
        type: "FABRIC",
        isActive: true,
        variants: [],
      }),
    ).rejects.toThrow("redirect");

    expect(requireAdmin).toHaveBeenCalled();
  });
});
