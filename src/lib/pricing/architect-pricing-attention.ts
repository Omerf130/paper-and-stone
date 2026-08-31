import {
  getItemPricingStatus,
  type ItemPricingFields,
  type ItemPricingStatus,
} from "@/lib/pricing/pricing-commercial-model";

export type ArchitectPricingAttention = {
  incompleteItemCount: number;
  needsReviewItemCount: number;
};

type ArchitectPricingFields = ItemPricingFields;

function resolveArchitectItemPricingStatus(
  pricing?: ArchitectPricingFields | null,
): ItemPricingStatus {
  if (pricing?.pricingStatus != null) {
    return pricing.pricingStatus;
  }

  return getItemPricingStatus(pricing);
}

export function isArchitectPricingIncomplete(
  pricing?: ArchitectPricingFields | null,
): boolean {
  return resolveArchitectItemPricingStatus(pricing) !== "priced";
}

export function getArchitectPricingAttentionFromItems(
  items: Array<{ architectPricing?: ArchitectPricingFields }>,
): ArchitectPricingAttention {
  let incompleteItemCount = 0;
  let needsReviewItemCount = 0;

  for (const item of items) {
    const status = resolveArchitectItemPricingStatus(item.architectPricing);

    if (status === "unpriced") {
      incompleteItemCount += 1;
    } else if (status === "needs_review") {
      needsReviewItemCount += 1;
    }
  }

  return {
    incompleteItemCount,
    needsReviewItemCount,
  };
}

export function hasArchitectPricingAttention(
  attention: ArchitectPricingAttention,
): boolean {
  return attention.incompleteItemCount > 0 || attention.needsReviewItemCount > 0;
}
