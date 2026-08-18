export type ProjectPricingAttention = {
  incompleteItemCount: number;
  missingInternalCostCount: number;
  missingArchitectPriceCount: number;
  missingClientPriceCount: number;
  staleClientPriceCount: number;
};

type PricingFields = {
  internalCostAgorot?: number | null;
  architectPriceAgorot?: number | null;
  clientPriceAgorot?: number | null;
  clientPriceStale?: boolean;
};

export function isPricingIncomplete(pricing?: PricingFields | null): boolean {
  return (
    pricing?.internalCostAgorot == null ||
    pricing?.architectPriceAgorot == null ||
    pricing?.clientPriceAgorot == null
  );
}

function countPricingAttentionFromFields<T>(
  items: T[],
  getPricing: (item: T) => PricingFields | null | undefined,
): ProjectPricingAttention {
  let incompleteItemCount = 0;
  let missingInternalCostCount = 0;
  let missingArchitectPriceCount = 0;
  let missingClientPriceCount = 0;
  let staleClientPriceCount = 0;

  for (const item of items) {
    const pricing = getPricing(item);

    if (pricing?.internalCostAgorot == null) {
      missingInternalCostCount += 1;
    }

    if (pricing?.architectPriceAgorot == null) {
      missingArchitectPriceCount += 1;
    }

    if (pricing?.clientPriceAgorot == null) {
      missingClientPriceCount += 1;
    }

    if (isPricingIncomplete(pricing)) {
      incompleteItemCount += 1;
    }

    if (pricing?.clientPriceStale) {
      staleClientPriceCount += 1;
    }
  }

  return {
    incompleteItemCount,
    missingInternalCostCount,
    missingArchitectPriceCount,
    missingClientPriceCount,
    staleClientPriceCount,
  };
}

export function getPricingAttentionFromAdminItems(
  items: Array<{
    adminPricing?: PricingFields;
  }>,
): ProjectPricingAttention {
  return countPricingAttentionFromFields(items, (item) => item.adminPricing);
}

export function hasPricingAttention(attention: ProjectPricingAttention): boolean {
  return attention.incompleteItemCount > 0 || attention.staleClientPriceCount > 0;
}

export function getPricingAttentionFromItemPricing(
  items: Array<{ pricing?: PricingFields | null }>,
): ProjectPricingAttention {
  return countPricingAttentionFromFields(items, (item) => item.pricing);
}
