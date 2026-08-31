import { describe, expect, it, vi, beforeEach } from "vitest";

const updateOneMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    updateOne: updateOneMock,
  },
}));

describe("project-item-logistics-mutations", () => {
  beforeEach(() => {
    updateOneMock.mockReset();
    updateOneMock.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
  });

  it("updates logistics status and note without touching pricing fields", async () => {
    const { updateProjectItemLogisticsAsAdmin } = await import(
      "@/lib/projects/project-item-logistics-mutations"
    );

    await updateProjectItemLogisticsAsAdmin("507f1f77bcf86cd799439013", {
      projectId: "507f1f77bcf86cd799439011",
      itemId: "507f1f77bcf86cd799439014",
      status: "ordered",
      note: "הוזמן מהספק",
    });

    expect(updateOneMock).toHaveBeenCalledWith(
      expect.objectContaining({
        onboardingStatus: "active",
        status: { $nin: ["rejected"] },
        "items._id": expect.anything(),
      }),
      {
        $set: expect.objectContaining({
          "items.$[item].logistics.status": "ordered",
          "items.$[item].logistics.note": "הוזמן מהספק",
        }),
      },
      expect.objectContaining({
        arrayFilters: expect.any(Array),
      }),
    );

    const updatePayload = updateOneMock.mock.calls[0]?.[1] as { $set?: Record<string, unknown> };
    const setKeys = Object.keys(updatePayload.$set ?? {});
    expect(setKeys.some((key) => key.includes("pricing"))).toBe(false);
    expect(setKeys.some((key) => key.includes("pricingReviewStatus"))).toBe(false);
    expect(setKeys.some((key) => key.includes("commercialDirty"))).toBe(false);
  });

  it("throws when item is not found", async () => {
    updateOneMock.mockResolvedValueOnce({ matchedCount: 0, modifiedCount: 0 });

    const { updateProjectItemLogisticsAsAdmin } = await import(
      "@/lib/projects/project-item-logistics-mutations"
    );

    await expect(
      updateProjectItemLogisticsAsAdmin("507f1f77bcf86cd799439013", {
        projectId: "507f1f77bcf86cd799439011",
        itemId: "507f1f77bcf86cd799439014",
        status: "shipped",
      }),
    ).rejects.toThrow();
  });
});
