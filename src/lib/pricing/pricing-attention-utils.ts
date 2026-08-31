import {
  getItemPricingStatus,
  isItemCommercialPricingComplete,
  type ItemPricingFields,
} from "@/lib/pricing/pricing-commercial-model";

export type ProjectPricingAttention = {
  incompleteItemCount: number;
  missingInternalCostCount: number;
  missingClientPriceCount: number;
  missingArchitectMarkupCount: number;
  needsReviewItemCount: number;
};

export type AdminLayerPricingAttention = ProjectPricingAttention;

export function isAdminLayerPricingIncomplete(
  pricing?: ItemPricingFields | null,
): boolean {
  return getItemPricingStatus(pricing) !== "priced";
}

export function isPricingIncomplete(pricing?: ItemPricingFields | null): boolean {
  return getItemPricingStatus(pricing) !== "priced";
}

function countAdminLayerPricingAttentionFromFields<T>(
  items: T[],
  getPricing: (item: T) => ItemPricingFields | null | undefined,
): AdminLayerPricingAttention {
  let incompleteItemCount = 0;
  let missingInternalCostCount = 0;
  let missingClientPriceCount = 0;
  let missingArchitectMarkupCount = 0;
  let needsReviewItemCount = 0;

  for (const item of items) {
    const pricing = getPricing(item);
    const status = getItemPricingStatus(pricing);

    if (pricing?.internalCostAgorot == null) {
      missingInternalCostCount += 1;
    }

    if (pricing?.clientPriceAgorot == null) {
      missingClientPriceCount += 1;
    }

    if (pricing?.architectMarkupBp == null) {
      missingArchitectMarkupCount += 1;
    }

    if (status === "needs_review") {
      needsReviewItemCount += 1;
    }

    if (status === "unpriced") {
      incompleteItemCount += 1;
    }
  }

  return {
    incompleteItemCount,
    missingInternalCostCount,
    missingClientPriceCount,
    missingArchitectMarkupCount,
    needsReviewItemCount,
  };
}

function countPricingAttentionFromFields<T>(
  items: T[],
  getPricing: (item: T) => ItemPricingFields | null | undefined,
): ProjectPricingAttention {
  return countAdminLayerPricingAttentionFromFields(items, getPricing);
}

export function getAdminLayerPricingAttentionFromItemPricing(
  items: Array<{ pricing?: ItemPricingFields | null }>,
): AdminLayerPricingAttention {
  return countAdminLayerPricingAttentionFromFields(items, (item) => item.pricing);
}

export function getPricingAttentionFromAdminItems(
  items: Array<{
    adminPricing?: ItemPricingFields;
  }>,
): ProjectPricingAttention {
  return countPricingAttentionFromFields(items, (item) => item.adminPricing);
}

export function hasPricingAttention(attention: ProjectPricingAttention): boolean {
  return attention.incompleteItemCount > 0 || attention.needsReviewItemCount > 0;
}

export function getPricingAttentionFromItemPricing(
  items: Array<{ pricing?: ItemPricingFields | null }>,
): ProjectPricingAttention {
  return countPricingAttentionFromFields(items, (item) => item.pricing);
}

export { isItemCommercialPricingComplete };
