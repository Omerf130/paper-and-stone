export type ArchitectPricingAttention = {
  incompleteItemCount: number;
  staleClientPriceCount: number;
};

type ArchitectPricingFields = {
  architectPriceAgorot?: number | null;
  clientPriceAgorot?: number | null;
  clientPriceStale?: boolean;
};

export function isArchitectPricingIncomplete(
  pricing?: ArchitectPricingFields | null,
): boolean {
  return (
    pricing?.architectPriceAgorot == null ||
    pricing?.clientPriceAgorot == null
  );
}

export function getArchitectPricingAttentionFromItems(
  items: Array<{ architectPricing?: ArchitectPricingFields }>,
): ArchitectPricingAttention {
  let incompleteItemCount = 0;
  let staleClientPriceCount = 0;

  for (const item of items) {
    const pricing = item.architectPricing;

    if (isArchitectPricingIncomplete(pricing)) {
      incompleteItemCount += 1;
    }

    if (pricing?.clientPriceStale) {
      staleClientPriceCount += 1;
    }
  }

  return {
    incompleteItemCount,
    staleClientPriceCount,
  };
}

export function hasArchitectPricingAttention(
  attention: ArchitectPricingAttention,
): boolean {
  return attention.incompleteItemCount > 0 || attention.staleClientPriceCount > 0;
}
