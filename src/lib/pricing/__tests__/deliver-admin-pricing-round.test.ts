import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PRICING_ERRORS } from "@/lib/pricing/pricing-validation";

const updateOneMock = vi.fn();
const findOneMock = vi.fn();

const projectId = "507f1f77bcf86cd799439011";
const adminUserId = "507f1f77bcf86cd799439013";

function createDeliverableProject(overrides?: {
  adminPricingRevision?: number;
  adminPricingDeliveredRevision?: number;
  itemPricing?: Record<string, unknown>;
}) {
  return {
    _id: new Types.ObjectId(projectId),
    onboardingStatus: "active",
    status: "approved",
    adminPricingRevision: overrides?.adminPricingRevision ?? 2,
    adminPricingDeliveredRevision: overrides?.adminPricingDeliveredRevision ?? 1,
    items: [
      {
        _id: new Types.ObjectId("507f1f77bcf86cd799439012"),
        productId: new Types.ObjectId("507f1f77bcf86cd799439014"),
        quantity: 1,
        pricing: overrides?.itemPricing ?? {
          internalCostAgorot: 100_000,
          architectPriceAgorot: 140_000,
          clientPriceAgorot: 210_000,
        },
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
  },
}));

describe("deliver-admin-pricing-round", () => {
  beforeEach(() => {
    updateOneMock.mockReset();
    findOneMock.mockReset();
    updateOneMock.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
    findOneMock.mockImplementation(async () => createDeliverableProject());
  });

  it("delivers pricing when revision matches and admin layer is complete", async () => {
    const { deliverAdminPricingRound } = await import(
      "@/lib/pricing/deliver-admin-pricing-round"
    );

    await deliverAdminPricingRound(adminUserId, {
      projectId,
      expectedAdminPricingRevision: 2,
    });

    expect(updateOneMock).toHaveBeenCalledWith(
      {
        _id: expect.any(Types.ObjectId),
        adminPricingRevision: 2,
      },
      expect.objectContaining({
        $set: { adminPricingDeliveredRevision: 2 },
        $push: {
          reviewHistory: expect.objectContaining({
            action: "admin_pricing_delivered",
          }),
        },
      }),
    );
  });

  it("rejects delivery when revision changed concurrently", async () => {
    const { deliverAdminPricingRound } = await import(
      "@/lib/pricing/deliver-admin-pricing-round"
    );

    await expect(
      deliverAdminPricingRound(adminUserId, {
        projectId,
        expectedAdminPricingRevision: 1,
      }),
    ).rejects.toMatchObject({
      message: PRICING_ERRORS.ADMIN_PRICING_DELIVERY_CONFLICT,
    });
  });

  it("rejects delivery when admin layer pricing is incomplete", async () => {
    findOneMock.mockImplementation(async () =>
      createDeliverableProject({
        itemPricing: {
          internalCostAgorot: 100_000,
        },
      }),
    );

    const { deliverAdminPricingRound } = await import(
      "@/lib/pricing/deliver-admin-pricing-round"
    );

    await expect(
      deliverAdminPricingRound(adminUserId, {
        projectId,
        expectedAdminPricingRevision: 2,
      }),
    ).rejects.toMatchObject({
      message: PRICING_ERRORS.ADMIN_PRICING_INCOMPLETE,
    });
  });

  it("rejects delivery when update loses the race", async () => {
    updateOneMock.mockResolvedValue({ matchedCount: 0, modifiedCount: 0 });

    const { deliverAdminPricingRound } = await import(
      "@/lib/pricing/deliver-admin-pricing-round"
    );

    await expect(
      deliverAdminPricingRound(adminUserId, {
        projectId,
        expectedAdminPricingRevision: 2,
      }),
    ).rejects.toBeInstanceOf(ProjectMutationError);
  });
});
