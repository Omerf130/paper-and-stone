import { describe, expect, it } from "vitest";
import {
  mapAdminProjectItemPricingView,
  mapArchitectProjectItemPricingView,
  mapClientProjectItemPricingView,
  mapProjectPricingSettingsView,
} from "@/lib/pricing/pricing-view-mappers";
import { mapProductToView } from "@/lib/products/mapProductToView";
import type { IProjectItem } from "@/models/Project";
import { Types } from "mongoose";

const pricedItem: IProjectItem = {
  _id: new Types.ObjectId(),
  productId: new Types.ObjectId(),
  selectedMaterialId: null,
  selectedColorId: null,
  selectedSizeKey: null,
  quantity: 2,
  snapshot: {
    productName: "ספה",
    productSlug: "sofa",
  },
  pricing: {
    priceVersion: 1,
    internalCostAgorot: 1_000_000,
    clientPriceAgorot: 1_600_000,
    architectMarkupBp: 2_000,
    architectProfitAgorot: 120_000,
    pricingReviewStatus: "none",
  },
};

describe("pricing view security", () => {
  it("does not expose admin pricing fields on architect view", () => {
    const view = mapArchitectProjectItemPricingView(pricedItem);

    expect(view.pricingStatus).toBe("priced");
    expect(view.hasArchitectProfit).toBe(true);
    expect(view.hasClientPrice).toBe(true);
    expect(view).not.toHaveProperty("internalCostAgorot");
    expect(view).not.toHaveProperty("commercialMarginAgorot");
    expect(view).not.toHaveProperty("architectMarkupBp");
    expect(view).not.toHaveProperty("paperStoneProfitAgorot");
    expect(view).not.toHaveProperty("internalCostFormatted");
  });

  it("hides commercial pricing on architect view when review is required", () => {
    const view = mapArchitectProjectItemPricingView({
      ...pricedItem,
      pricing: {
        ...pricedItem.pricing!,
        pricingReviewStatus: "needs_review",
      },
    });

    expect(view.pricingStatus).toBe("needs_review");
    expect(view.hasArchitectProfit).toBe(false);
    expect(view.hasClientPrice).toBe(false);
  });

  it("does not expose upstream pricing on client view", () => {
    const view = mapClientProjectItemPricingView(pricedItem);

    expect(view.hasClientPrice).toBe(true);
    expect(view).not.toHaveProperty("architectProfitAgorot");
    expect(view).not.toHaveProperty("internalCostAgorot");
    expect(view).not.toHaveProperty("architectMarkupBp");
    expect(view).not.toHaveProperty("commercialMarginAgorot");
  });

  it("exposes full commercial structure on admin view", () => {
    const view = mapAdminProjectItemPricingView(pricedItem);

    expect(view.hasInternalCost).toBe(true);
    expect(view.hasClientPrice).toBe(true);
    expect(view.hasArchitectMarkup).toBe(true);
    expect(view.architectMarkupPercent).toBe("20");
    expect(view.hasCommercialMargin).toBe(true);
    expect(view.hasPaperStoneProfit).toBe(true);
    expect(view.hasArchitectProfit).toBe(true);
    expect(view.clientLineTotalAgorot).toBe(3_200_000);
    expect(view.commercialMarginLineTotalAgorot).toBe(1_200_000);
  });

  it("does not expose defaultInternalCostAgorot on public product view", async () => {
    const view = await mapProductToView({
      _id: new Types.ObjectId(),
      nameHe: "ספה",
      slug: "sofa",
      sku: "SOFA-1",
      categoryId: { nameHe: "סלון" },
      isActive: true,
      isFeatured: false,
      materials: [],
      materialOptions: [],
      sizes: [],
      media: { gallery: [] },
      recolorConfig: { enabled: false, status: "missing_primary" },
      defaultInternalCostAgorot: 100_000,
      internalCatalogName: "Internal Sofa",
      catalogCode: "CAT-001",
      supplierId: new Types.ObjectId(),
    } as never);

    expect(view).not.toHaveProperty("defaultInternalCostAgorot");
    expect(view).not.toHaveProperty("internalCatalogName");
    expect(view).not.toHaveProperty("catalogCode");
    expect(view).not.toHaveProperty("supplierId");
  });

  it("does not expose admin-only settings on shared pricing settings view", () => {
    const view = mapProjectPricingSettingsView({
      onboardingStatus: "active",
      status: "approved",
    });

    expect(view.usesLayeredPricing).toBe(true);
    expect(view.isAdminPricingEditable).toBe(true);
    expect(view).not.toHaveProperty("defaultAdminMarkupBp");
    expect(view).not.toHaveProperty("defaultArchitectMarkupBp");
  });
});
