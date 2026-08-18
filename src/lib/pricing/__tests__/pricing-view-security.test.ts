import { describe, expect, it } from "vitest";
import {
  mapArchitectProjectItemPricingView,
  mapArchitectProjectPricingSettingsView,
  mapClientProjectItemPricingView,
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
    internalCostAgorot: 100_000,
    adminMarkupBp: 20_000,
    architectPriceAgorot: 120_000,
    architectMarkupBp: 50_000,
    clientPriceAgorot: 180_000,
    clientPriceStale: true,
  },
};

describe("pricing view security", () => {
  it("does not expose admin pricing fields on architect view", () => {
    const view = mapArchitectProjectItemPricingView(pricedItem, {
      defaultArchitectMarkupBp: 50_000,
    });

    expect(view.hasArchitectPrice).toBe(true);
    expect(view).not.toHaveProperty("internalCostAgorot");
    expect(view).not.toHaveProperty("adminMarkupBp");
    expect(view).not.toHaveProperty("internalCostFormatted");
  });

  it("does not expose upstream pricing on client view", () => {
    const view = mapClientProjectItemPricingView(pricedItem);

    expect(view.hasClientPrice).toBe(false);
    expect(view).not.toHaveProperty("architectPriceAgorot");
    expect(view).not.toHaveProperty("architectMarkupBp");
    expect(view).not.toHaveProperty("internalCostAgorot");
    expect(view).not.toHaveProperty("adminMarkupBp");
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
    } as never);

    expect(view).not.toHaveProperty("defaultInternalCostAgorot");
  });

  it("does not expose admin pricing fields on architect settings view", () => {
    const view = mapArchitectProjectPricingSettingsView({
      defaultArchitectMarkupBp: 5_000,
      defaultAdminMarkupBp: 20_000,
      onboardingStatus: "active",
      status: "approved",
    } as never);

    expect(view.defaultArchitectMarkupPercent).toBe("50");
    expect(view).not.toHaveProperty("defaultAdminMarkupBp");
    expect(view).not.toHaveProperty("defaultAdminMarkupPercent");
    expect(view).not.toHaveProperty("isAdminPricingEditable");
    expect(view).not.toHaveProperty("adminPricingUnavailableReason");
  });
});
