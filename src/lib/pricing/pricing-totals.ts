import type { IProjectItem } from "@/models/Project";
import {
  calculateLineTotalAgorot,
  sumLineTotalsAgorot,
} from "@/lib/pricing/pricing-calculations";
import { isPricingIncomplete } from "@/lib/pricing/pricing-attention-utils";
import type {
  AdminPricingTotalsView,
  ArchitectPricingTotalsView,
  ClientPricingTotalsView,
  PricingTotalsView,
} from "@/types/project-pricing";

function buildBaseTotals(items: IProjectItem[]): PricingTotalsView {
  let pricedItemCount = 0;
  let unpricedItemCount = 0;
  let staleItemCount = 0;

  for (const item of items) {
    const pricing = item.pricing;

    if (
      pricing?.architectPriceAgorot != null &&
      pricing.clientPriceAgorot != null
    ) {
      pricedItemCount += 1;
    } else {
      unpricedItemCount += 1;
    }

    if (pricing?.clientPriceStale) {
      staleItemCount += 1;
    }
  }

  return {
    pricedItemCount,
    unpricedItemCount,
    staleItemCount,
    isComplete: unpricedItemCount === 0 && staleItemCount === 0,
  };
}

function buildAdminBaseTotals(items: IProjectItem[]): PricingTotalsView {
  let pricedItemCount = 0;
  let unpricedItemCount = 0;
  let staleItemCount = 0;

  for (const item of items) {
    const pricing = item.pricing;

    if (!isPricingIncomplete(pricing)) {
      pricedItemCount += 1;
    } else {
      unpricedItemCount += 1;
    }

    if (pricing?.clientPriceStale) {
      staleItemCount += 1;
    }
  }

  return {
    pricedItemCount,
    unpricedItemCount,
    staleItemCount,
    isComplete: unpricedItemCount === 0 && staleItemCount === 0,
  };
}

export function calculateAdminPricingTotals(
  items: IProjectItem[],
): AdminPricingTotalsView {
  const base = buildAdminBaseTotals(items);
  const internalLineTotals: number[] = [];
  const architectLineTotals: number[] = [];
  const clientLineTotals: number[] = [];

  for (const item of items) {
    const pricing = item.pricing;

    if (pricing?.internalCostAgorot != null) {
      internalLineTotals.push(
        calculateLineTotalAgorot(pricing.internalCostAgorot, item.quantity),
      );
    }

    if (pricing?.architectPriceAgorot != null) {
      architectLineTotals.push(
        calculateLineTotalAgorot(pricing.architectPriceAgorot, item.quantity),
      );
    }

    if (pricing?.clientPriceAgorot != null) {
      clientLineTotals.push(
        calculateLineTotalAgorot(pricing.clientPriceAgorot, item.quantity),
      );
    }
  }

  const allInternalPriced = internalLineTotals.length === items.length && items.length > 0;
  const allArchitectPriced = architectLineTotals.length === items.length && items.length > 0;
  const allClientPriced = clientLineTotals.length === items.length && items.length > 0;

  return {
    ...base,
    internalCostTotalAgorot: allInternalPriced
      ? sumLineTotalsAgorot(internalLineTotals)
      : undefined,
    architectTotalAgorot: allArchitectPriced
      ? sumLineTotalsAgorot(architectLineTotals)
      : undefined,
    clientTotalAgorot: allClientPriced
      ? sumLineTotalsAgorot(clientLineTotals)
      : undefined,
  };
}

export function calculateArchitectPricingTotals(
  items: IProjectItem[],
): ArchitectPricingTotalsView {
  const base = buildBaseTotals(items);
  const architectLineTotals: number[] = [];
  const clientLineTotals: number[] = [];

  for (const item of items) {
    const pricing = item.pricing;

    if (pricing?.architectPriceAgorot != null) {
      architectLineTotals.push(
        calculateLineTotalAgorot(pricing.architectPriceAgorot, item.quantity),
      );
    }

    if (pricing?.clientPriceAgorot != null) {
      clientLineTotals.push(
        calculateLineTotalAgorot(pricing.clientPriceAgorot, item.quantity),
      );
    }
  }

  const allArchitectPriced = architectLineTotals.length === items.length && items.length > 0;
  const allClientPriced = clientLineTotals.length === items.length && items.length > 0;

  return {
    ...base,
    architectTotalAgorot: allArchitectPriced
      ? sumLineTotalsAgorot(architectLineTotals)
      : undefined,
    clientTotalAgorot: allClientPriced
      ? sumLineTotalsAgorot(clientLineTotals)
      : undefined,
  };
}

export function calculateClientPricingTotals(
  items: IProjectItem[],
): ClientPricingTotalsView {
  const base = buildBaseTotals(items);
  const clientLineTotals: number[] = [];

  for (const item of items) {
    const pricing = item.pricing;

    if (pricing?.clientPriceAgorot != null && !pricing.clientPriceStale) {
      clientLineTotals.push(
        calculateLineTotalAgorot(pricing.clientPriceAgorot, item.quantity),
      );
    }
  }

  const allClientPriced = clientLineTotals.length === items.length && items.length > 0;

  return {
    ...base,
    clientTotalAgorot: allClientPriced
      ? sumLineTotalsAgorot(clientLineTotals)
      : undefined,
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
