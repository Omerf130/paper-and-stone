import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PRICING_ERRORS } from "@/lib/pricing/pricing-validation";

const updateOneMock = vi.fn();
const findOneMock = vi.fn();
const findByIdMock = vi.fn();

const projectId = "507f1f77bcf86cd799439011";
const itemId = "507f1f77bcf86cd799439012";
const adminUserId = "507f1f77bcf86cd799439013";

function createEditableProject(overrides?: {
  itemPricing?: Record<string, unknown> | null;
  status?: string;
}) {
  return {
    _id: new Types.ObjectId(projectId),
    onboardingStatus: "active",
    status: overrides?.status ?? "approved",
    items: [
      {
        _id: new Types.ObjectId(itemId),
        productId: new Types.ObjectId("507f1f77bcf86cd799439014"),
        quantity: 1,
        pricing: overrides?.itemPricing === null
          ? undefined
          : (overrides?.itemPricing ?? {
              priceVersion: 1,
              internalCostAgorot: 1_000_000,
              clientPriceAgorot: 1_600_000,
              architectMarkupBp: 2_000,
              architectProfitAgorot: 120_000,
              pricingReviewStatus: "none",
            }),
      },
    ],
  };
}

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    updateOne: updateOneMock,
    findOne: findOneMock,
    findById: findByIdMock,
  },
}));

describe("project-pricing-admin-mutations", () => {
  beforeEach(() => {
    updateOneMock.mockReset();
    findOneMock.mockReset();
    findByIdMock.mockReset();
    updateOneMock.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
    findOneMock.mockImplementation(async () => createEditableProject());
  });

  it("creates pricing subdocument on first save for item without pricing", async () => {
    findOneMock.mockImplementation(async () =>
      createEditableProject({ itemPricing: null }),
    );

    const { setProjectItemAdminPricing } = await import(
      "@/lib/pricing/project-pricing-admin-mutations"
    );

    await setProjectItemAdminPricing(adminUserId, {
      projectId,
      itemId,
      internalCostAgorot: 1_000_000,
      clientPriceAgorot: 1_600_000,
      architectMarkupBp: 2_000,
      expectedPriceVersion: 0,
    });

    expect(updateOneMock).toHaveBeenCalledTimes(1);

    const [filter, updateDoc, options] = updateOneMock.mock.calls[0];

    expect(filter.items.$elemMatch.pricing).toEqual({ $exists: false });
    expect(updateDoc.$set["items.$[item].pricing"]).toMatchObject({
      internalCostAgorot: 1_000_000,
      clientPriceAgorot: 1_600_000,
      architectMarkupBp: 2_000,
      architectProfitAgorot: 120_000,
      priceVersion: 1,
      pricingReviewStatus: "none",
      clientPriceStale: false,
    });
    expect(options.arrayFilters[0]["item._id"]).toBeDefined();
  });

  it("updates existing pricing with dotted paths and version guard", async () => {
    const { setProjectItemAdminPricing } = await import(
      "@/lib/pricing/project-pricing-admin-mutations"
    );

    await setProjectItemAdminPricing(adminUserId, {
      projectId,
      itemId,
      internalCostAgorot: 1_000_000,
      clientPriceAgorot: 1_700_000,
      architectMarkupBp: 2_500,
      expectedPriceVersion: 1,
    });

    expect(updateOneMock).toHaveBeenCalledTimes(1);

    const [, updateDoc, options] = updateOneMock.mock.calls[0];

    expect(updateDoc.$set).toMatchObject({
      "items.$[item].pricing.internalCostAgorot": 1_000_000,
      "items.$[item].pricing.clientPriceAgorot": 1_700_000,
      "items.$[item].pricing.architectMarkupBp": 2_500,
      "items.$[item].pricing.architectProfitAgorot": 175_000,
      "items.$[item].pricing.priceVersion": 2,
    });
    expect(updateDoc.$unset).toEqual({
      "items.$[item].pricing.architectPriceAgorot": "",
    });
    expect(options.arrayFilters[0]["item.pricing.priceVersion"]).toBe(1);
  });

  it("throws version conflict when update modifies nothing", async () => {
    updateOneMock.mockResolvedValue({ matchedCount: 1, modifiedCount: 0 });
    findByIdMock.mockReturnValue({
      select: vi.fn().mockResolvedValue(createEditableProject()),
    });

    const { setProjectItemAdminPricing } = await import(
      "@/lib/pricing/project-pricing-admin-mutations"
    );

    await expect(
      setProjectItemAdminPricing(adminUserId, {
        projectId,
        itemId,
        internalCostAgorot: 1_000_000,
        clientPriceAgorot: 1_600_000,
        architectMarkupBp: 2_000,
        expectedPriceVersion: 1,
      }),
    ).rejects.toThrow(
      new ProjectMutationError(PRICING_ERRORS.VERSION_CONFLICT),
    );
  });

  it("allows pricing on submitted active projects", async () => {
    findOneMock.mockImplementation(async () =>
      createEditableProject({ status: "submitted", itemPricing: null }),
    );

    const { setProjectItemAdminPricing } = await import(
      "@/lib/pricing/project-pricing-admin-mutations"
    );

    await expect(
      setProjectItemAdminPricing(adminUserId, {
        projectId,
        itemId,
        internalCostAgorot: 1_000_000,
        clientPriceAgorot: 1_600_000,
        architectMarkupBp: 2_000,
        expectedPriceVersion: 0,
      }),
    ).resolves.toBeUndefined();
  });
});
