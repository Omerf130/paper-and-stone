import { describe, expect, it } from "vitest";
import { Types } from "mongoose";
import {
  calculatePaymentReadyPricingTotals,
} from "@/lib/pricing/pricing-totals";
import type { IProjectItem } from "@/models/Project";

function pricedItem(clientPriceAgorot: number): IProjectItem {
  return {
    _id: new Types.ObjectId(),
    productId: new Types.ObjectId(),
    quantity: 1,
    pricing: {
      internalCostAgorot: 100_000,
      clientPriceAgorot,
      architectMarkupBp: 5000,
      architectProfitAgorot: 5_000,
      priceVersion: 2,
      pricingReviewStatus: "none",
    },
  } as IProjectItem;
}

function needsReviewItem(clientPriceAgorot: number): IProjectItem {
  return {
    ...pricedItem(clientPriceAgorot),
    pricing: {
      ...pricedItem(clientPriceAgorot).pricing!,
      pricingReviewStatus: "needs_review",
    },
  } as IProjectItem;
}

describe("calculatePaymentReadyPricingTotals", () => {
  it("includes only priced items in payment-ready totals", () => {
    const totals = calculatePaymentReadyPricingTotals([
      pricedItem(200_000),
      needsReviewItem(300_000),
    ]);

    expect(totals.pricedItemCount).toBe(1);
    expect(totals.needsReviewItemCount).toBe(0);
    expect(totals.clientTotalInclVatAgorot).toBeDefined();
  });

  it("returns complete totals when all items are priced", () => {
    const totals = calculatePaymentReadyPricingTotals([
      pricedItem(200_000),
      pricedItem(150_000),
    ]);

    expect(totals.isComplete).toBe(true);
    expect(totals.clientTotalInclVatAgorot).toBeDefined();
  });
});
