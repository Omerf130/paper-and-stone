import type { IProjectItemPricing } from "@/models/Project";
import type { AdminCommercialPricingInput } from "@/lib/pricing/pricing-commercial-model";
import { validateAdminCommercialPricingInput } from "@/lib/pricing/pricing-commercial-model";

export function createInitialItemPricing(): undefined {
  return undefined;
}

export function applyAdminCommercialPricingUpdate(input: {
  pricing: IProjectItemPricing;
  commercialPricing: AdminCommercialPricingInput;
}): IProjectItemPricing {
  const validation = validateAdminCommercialPricingInput(input.commercialPricing);
  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const { resolved } = validation;
  const nextPricing = { ...input.pricing };
  delete nextPricing.architectPriceAgorot;

  return {
    ...nextPricing,
    internalCostAgorot: resolved.internalCostAgorot,
    clientPriceAgorot: resolved.clientPriceAgorot,
    architectMarkupBp: resolved.architectMarkupBp,
    architectProfitAgorot: resolved.architectProfitAgorot,
    pricingReviewStatus: "none",
    clientPriceStale: false,
    priceVersion: (input.pricing.priceVersion ?? 0) + 1,
  };
}
