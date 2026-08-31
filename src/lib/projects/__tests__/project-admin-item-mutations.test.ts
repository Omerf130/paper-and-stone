import { describe, expect, it, vi, beforeEach } from "vitest";

const updateOneMock = vi.fn();
const findOneMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    updateOne: updateOneMock,
    findOne: findOneMock,
  },
}));

vi.mock("@/lib/projects/verifyProjectItemSelection", () => ({
  verifyProjectItemSelectionForAdd: vi.fn(async () => ({
    productId: "507f1f77bcf86cd799439012",
    productView: {
      slug: "milano-sofa",
      nameHe: "Milano",
      sku: "SKU-1",
      materialOptions: [],
      sizes: [],
    },
    selectedMaterialId: null,
    selectedColorId: null,
    selectedSizeKey: null,
  })),
  verifyProjectItemSelectionForEdit: vi.fn(),
}));

vi.mock("@/lib/projects/buildProjectItemSnapshot", () => ({
  buildProjectItemSnapshot: vi.fn(() => ({
    productName: "Milano",
    productSlug: "milano-sofa",
    sku: "SKU-1",
  })),
}));

vi.mock("@/lib/projects/project-room-mutations", () => ({
  verifyRoomBelongsToProject: vi.fn(async () => undefined),
}));

describe("project-admin-item-mutations", () => {
  const activeProject = {
    _id: { toString: () => "507f1f77bcf86cd799439013" },
    onboardingStatus: "active" as const,
    status: "draft" as const,
    commercialDirty: false,
    adminPricingRevision: 0,
    adminPricingDeliveredRevision: 0,
    items: [],
  };

  beforeEach(() => {
    updateOneMock.mockReset();
    findOneMock.mockReset();
    updateOneMock.mockResolvedValue({ modifiedCount: 0, matchedCount: 1 });
    findOneMock.mockResolvedValue(activeProject);
  });

  it("adds product without room as orphan item", async () => {
    updateOneMock.mockResolvedValueOnce({ modifiedCount: 1, matchedCount: 1 });

    const { addProductToProjectAsAdmin } = await import(
      "@/lib/projects/project-admin-item-mutations"
    );

    await addProductToProjectAsAdmin(
      "507f1f77bcf86cd799439013",
      "milano-sofa",
      1,
    );

    expect(updateOneMock).toHaveBeenCalledWith(
      expect.objectContaining({
        onboardingStatus: "active",
        status: { $nin: ["rejected"] },
        items: expect.objectContaining({
          $elemMatch: expect.objectContaining({
            roomId: null,
          }),
        }),
      }),
      expect.objectContaining({
        $inc: expect.objectContaining({
          "items.$.quantity": 1,
        }),
      }),
    );
  });

  it("pushes new orphan item when no matching selection exists", async () => {
    updateOneMock
      .mockResolvedValueOnce({ modifiedCount: 0, matchedCount: 0 })
      .mockResolvedValueOnce({ modifiedCount: 0, matchedCount: 1 });

    const { addProductToProjectAsAdmin } = await import(
      "@/lib/projects/project-admin-item-mutations"
    );

    await addProductToProjectAsAdmin(
      "507f1f77bcf86cd799439013",
      "milano-sofa",
      2,
    );

    expect(updateOneMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        onboardingStatus: "active",
      }),
      expect.objectContaining({
        $push: expect.objectContaining({
          items: expect.objectContaining({
            roomId: null,
            quantity: 2,
          }),
        }),
      }),
    );
  });

  it("adds product to selected room when roomId is provided", async () => {
    updateOneMock.mockResolvedValueOnce({ modifiedCount: 1, matchedCount: 1 });

    const { addProductToProjectAsAdmin } = await import(
      "@/lib/projects/project-admin-item-mutations"
    );

    await addProductToProjectAsAdmin(
      "507f1f77bcf86cd799439013",
      "milano-sofa",
      1,
      undefined,
      undefined,
      undefined,
      "507f1f77bcf86cd799439099",
    );

    expect(updateOneMock).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.objectContaining({
          $elemMatch: expect.objectContaining({
            roomId: expect.anything(),
          }),
        }),
      }),
      expect.any(Object),
    );
  });
});

describe("project-admin-item-mutations update", () => {
  const itemId = "507f1f77bcf86cd799439014";
  const activeProjectWithItem = {
    onboardingStatus: "active" as const,
    status: "approved" as const,
    commercialDirty: true,
    adminPricingRevision: 1,
    adminPricingDeliveredRevision: 0,
    items: [
      {
        _id: { toString: () => itemId },
        productId: { toString: () => "507f1f77bcf86cd799439012" },
        selectedMaterialId: null,
        selectedColorId: null,
        selectedSizeKey: null,
        quantity: 2,
        pricing: {
          pricingReviewStatus: "none",
          internalCostAgorot: 10000,
          clientPriceAgorot: 16000,
          architectMarkupBp: 2000,
        },
      },
    ],
  };

  beforeEach(() => {
    updateOneMock.mockReset();
    findOneMock.mockReset();
    updateOneMock.mockResolvedValue({ matchedCount: 1 });
    findOneMock.mockResolvedValue(activeProjectWithItem);
  });

  it("does not mark pricing needs_review on quantity-only update", async () => {
    const { verifyProjectItemSelectionForEdit } = await import(
      "@/lib/projects/verifyProjectItemSelection"
    );
    vi.mocked(verifyProjectItemSelectionForEdit).mockResolvedValue({
      productId: "507f1f77bcf86cd799439012",
      productView: {
        slug: "milano-sofa",
        nameHe: "Milano",
        sku: "SKU-1",
        materialOptions: [],
        sizes: [],
      } as unknown as import("@/types/product").ProductView,
      selectedMaterialId: null,
      selectedColorId: null,
      selectedSizeKey: null,
    });

    const { updateProjectItemAsAdmin } = await import(
      "@/lib/projects/project-admin-item-mutations"
    );

    await updateProjectItemAsAdmin(
      "507f1f77bcf86cd799439013",
      itemId,
      5,
    );

    const updateCall = updateOneMock.mock.calls[0];
    const updatePayload = updateCall[1] as { $set?: Record<string, unknown> };

    expect(updatePayload.$set?.["items.$[item].pricing.pricingReviewStatus"]).toBeUndefined();
    expect(updatePayload.$set?.["items.$[item].quantity"]).toBe(5);
  });
});
