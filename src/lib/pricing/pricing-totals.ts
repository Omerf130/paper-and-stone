import type { IProjectItem } from "@/models/Project";
import {
  calculateLineTotalAgorot,
  sumLineTotalsAgorot,
} from "@/lib/pricing/pricing-calculations";
import {
  getItemPricingStatus,
  isItemCommercialPricingComplete,
  resolveItemCommercialPricing,
} from "@/lib/pricing/pricing-commercial-model";
import { calculateLayeredPricingVatTotals } from "@/lib/pricing/pricing-vat";
import type {
  AdminPricingTotalsView,
  ArchitectPricingTotalsView,
  ClientPricingTotalsView,
  PricingTotalsView,
} from "@/types/project-pricing";

function buildPricingTotalsBase(items: IProjectItem[]): PricingTotalsView {
  let pricedItemCount = 0;
  let unpricedItemCount = 0;
  let needsReviewItemCount = 0;

  for (const item of items) {
    const status = getItemPricingStatus(item.pricing);

    if (status === "priced") {
      pricedItemCount += 1;
    } else if (status === "needs_review") {
      needsReviewItemCount += 1;
    } else {
      unpricedItemCount += 1;
    }
  }

  return {
    pricedItemCount,
    unpricedItemCount,
    needsReviewItemCount,
    isComplete: unpricedItemCount === 0 && needsReviewItemCount === 0,
  };
}

function allItemsArePriced(items: IProjectItem[]): boolean {
  return (
    items.length > 0 &&
    items.every((item) => getItemPricingStatus(item.pricing) === "priced")
  );
}

export function calculatePaymentReadyPricingTotals(
  items: IProjectItem[],
): AdminPricingTotalsView {
  const pricedItems = items.filter(
    (item) => getItemPricingStatus(item.pricing) === "priced",
  );

  return calculateAdminPricingTotals(pricedItems);
}

export function calculateAdminPricingTotals(
  items: IProjectItem[],
): AdminPricingTotalsView {
  const base = buildPricingTotalsBase(items);
  const internalLineTotals: number[] = [];
  const commercialMarginLineTotals: number[] = [];
  const paperStoneProfitLineTotals: number[] = [];
  const architectProfitLineTotals: number[] = [];
  const clientLineTotals: number[] = [];

  for (const item of items) {
    const resolved = resolveItemCommercialPricing(item.pricing);

    if (item.pricing?.internalCostAgorot != null) {
      internalLineTotals.push(
        calculateLineTotalAgorot(item.pricing.internalCostAgorot, item.quantity),
      );
    }

    if (resolved != null) {
      commercialMarginLineTotals.push(
        calculateLineTotalAgorot(resolved.commercialMarginAgorot, item.quantity),
      );
      paperStoneProfitLineTotals.push(
        calculateLineTotalAgorot(resolved.paperStoneProfitAgorot, item.quantity),
      );
      architectProfitLineTotals.push(
        calculateLineTotalAgorot(resolved.architectProfitAgorot, item.quantity),
      );
      clientLineTotals.push(
        calculateLineTotalAgorot(resolved.clientPriceAgorot, item.quantity),
      );
    }
  }

  const allInternalPriced =
    internalLineTotals.length === items.length && items.length > 0;
  const allResolvedPriced =
    clientLineTotals.length === items.length && items.length > 0;

  const clientSubtotalAgorot = allResolvedPriced
    ? sumLineTotalsAgorot(clientLineTotals)
    : undefined;
  const vatTotals =
    clientSubtotalAgorot != null
      ? calculateLayeredPricingVatTotals(clientSubtotalAgorot)
      : undefined;

  return {
    ...base,
    internalCostTotalAgorot: allInternalPriced
      ? sumLineTotalsAgorot(internalLineTotals)
      : undefined,
    commercialMarginTotalAgorot: allResolvedPriced
      ? sumLineTotalsAgorot(commercialMarginLineTotals)
      : undefined,
    paperStoneProfitTotalAgorot: allResolvedPriced
      ? sumLineTotalsAgorot(paperStoneProfitLineTotals)
      : undefined,
    architectProfitTotalAgorot: allResolvedPriced
      ? sumLineTotalsAgorot(architectProfitLineTotals)
      : undefined,
    clientSubtotalAgorot,
    vatRateBasisPoints: vatTotals?.vatRateBasisPoints,
    vatAmountAgorot: vatTotals?.vatAmountAgorot,
    clientTotalInclVatAgorot: vatTotals?.clientTotalInclVatAgorot,
    clientTotalAgorot: clientSubtotalAgorot,
  };
}

export function calculateArchitectPricingTotals(
  items: IProjectItem[],
): ArchitectPricingTotalsView {
  const base = buildPricingTotalsBase(items);
  const architectProfitLineTotals: number[] = [];
  const clientLineTotals: number[] = [];

  for (const item of items) {
    if (getItemPricingStatus(item.pricing) !== "priced") {
      continue;
    }

    const resolved = resolveItemCommercialPricing(item.pricing);
    if (resolved == null) {
      continue;
    }

    architectProfitLineTotals.push(
      calculateLineTotalAgorot(resolved.architectProfitAgorot, item.quantity),
    );
    clientLineTotals.push(
      calculateLineTotalAgorot(resolved.clientPriceAgorot, item.quantity),
    );
  }

  const allClientPriced = allItemsArePriced(items);
  const clientSubtotalAgorot = allClientPriced
    ? sumLineTotalsAgorot(clientLineTotals)
    : undefined;
  const vatTotals =
    clientSubtotalAgorot != null
      ? calculateLayeredPricingVatTotals(clientSubtotalAgorot)
      : undefined;

  return {
    ...base,
    architectProfitTotalAgorot: allClientPriced
      ? sumLineTotalsAgorot(architectProfitLineTotals)
      : undefined,
    clientSubtotalAgorot,
    vatRateBasisPoints: vatTotals?.vatRateBasisPoints,
    vatAmountAgorot: vatTotals?.vatAmountAgorot,
    clientTotalInclVatAgorot: vatTotals?.clientTotalInclVatAgorot,
    clientTotalAgorot: clientSubtotalAgorot,
  };
}

export function calculateClientPricingTotals(
  items: IProjectItem[],
): ClientPricingTotalsView {
  const base = buildPricingTotalsBase(items);
  const clientLineTotals: number[] = [];

  for (const item of items) {
    if (getItemPricingStatus(item.pricing) !== "priced") {
      continue;
    }

    const resolved = resolveItemCommercialPricing(item.pricing);
    if (resolved == null) {
      continue;
    }

    clientLineTotals.push(
      calculateLineTotalAgorot(resolved.clientPriceAgorot, item.quantity),
    );
  }

  const allClientPriced = allItemsArePriced(items);
  const clientSubtotalAgorot = allClientPriced
    ? sumLineTotalsAgorot(clientLineTotals)
    : undefined;
  const vatTotals =
    clientSubtotalAgorot != null
      ? calculateLayeredPricingVatTotals(clientSubtotalAgorot)
      : undefined;

  return {
    ...base,
    clientSubtotalAgorot,
    vatRateBasisPoints: vatTotals?.vatRateBasisPoints,
    vatAmountAgorot: vatTotals?.vatAmountAgorot,
    clientTotalInclVatAgorot: vatTotals?.clientTotalInclVatAgorot,
    clientTotalAgorot: clientSubtotalAgorot,
  };
}

export function calculateRoomPricingTotals(
  items: IProjectItem[],
  roomId: string,
): AdminPricingTotalsView {
  return calculateAdminPricingTotals(
    items.filter((item) => item.roomId?.toString() === roomId),
  );
}

export { getItemPricingStatus, isItemCommercialPricingComplete };
