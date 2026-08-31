import type { IProjectItemPricing } from "@/models/Project";
import {
  calculateArchitectPriceAgorot,
  calculateClientPriceAgorot,
} from "@/lib/pricing/pricing-calculations";
import {
  getEffectiveAdminMarkupBp,
  getEffectiveArchitectMarkupBp,
} from "@/lib/pricing/pricing-inheritance";
import type { IProject } from "@/models/Project";

/** @deprecated Pricing V1 helpers — retained for migration only */
export function createInitialItemPricingV1(input: {
  defaultInternalCostAgorot?: number | null;
  project: Pick<IProject, "defaultAdminMarkupBp" | "defaultArchitectMarkupBp">;
}): IProjectItemPricing | undefined {
  const pricing: IProjectItemPricing = {
    priceVersion: 0,
    clientPriceStale: false,
    pricingReviewStatus: "none",
  };

  if (input.defaultInternalCostAgorot == null) {
    return undefined;
  }

  pricing.internalCostAgorot = input.defaultInternalCostAgorot;

  const adminMarkupBp = getEffectiveAdminMarkupBp({ pricing }, input.project);

  if (adminMarkupBp != null) {
    pricing.architectPriceAgorot = calculateArchitectPriceAgorot(
      pricing.internalCostAgorot,
      adminMarkupBp,
    );
  }

  const architectMarkupBp = getEffectiveArchitectMarkupBp({ pricing }, input.project);

  if (pricing.architectPriceAgorot != null && architectMarkupBp != null) {
    pricing.clientPriceAgorot = calculateClientPriceAgorot(
      pricing.architectPriceAgorot,
      architectMarkupBp,
    );
  }

  return pricing;
}

/** @deprecated Pricing V1 */
export function applyAdminPricingUpdate(input: {
  pricing: IProjectItemPricing;
  internalCostAgorot: number;
  adminMarkupBp: number;
  hadClientPrice: boolean;
}): IProjectItemPricing {
  const architectPriceAgorot = calculateArchitectPriceAgorot(
    input.internalCostAgorot,
    input.adminMarkupBp,
  );

  const next: IProjectItemPricing = {
    ...input.pricing,
    internalCostAgorot: input.internalCostAgorot,
    architectPriceAgorot,
    priceVersion: (input.pricing.priceVersion ?? 0) + 1,
    clientPriceStale: input.hadClientPrice,
  };

  if (!input.hadClientPrice) {
    next.clientPriceStale = false;
  }

  return next;
}

/** @deprecated Pricing V1 */
export function applyArchitectPricingUpdate(input: {
  pricing: IProjectItemPricing;
  architectPriceAgorot: number;
  architectMarkupBp: number;
}): IProjectItemPricing {
  return {
    ...input.pricing,
    clientPriceAgorot: calculateClientPriceAgorot(
      input.architectPriceAgorot,
      input.architectMarkupBp,
    ),
    clientPriceStale: false,
    priceVersion: (input.pricing.priceVersion ?? 0) + 1,
  };
}
