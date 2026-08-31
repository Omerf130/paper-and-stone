import {
  calculateArchitectProfitFromMarginShare,
  calculateCommercialMarginAgorot,
  calculatePaperStoneProfitFromMarginShare,
} from "@/lib/pricing/pricing-calculations";
import { isValidArchitectMarginShareBasisPoints } from "@/lib/pricing/markup-basis-points";

export const PRICING_REVIEW_STATUSES = ["none", "needs_review"] as const;
export type PricingReviewStatus = (typeof PRICING_REVIEW_STATUSES)[number];

export type ItemPricingStatus = "unpriced" | "priced" | "needs_review";

/** Authoritative admin input — stored on the project item. */
export type AdminCommercialPricingInput = {
  internalCostAgorot: number;
  clientPriceAgorot: number;
  architectMarkupBp: number;
};

export type ResolvedCommercialPricing = AdminCommercialPricingInput & {
  commercialMarginAgorot: number;
  architectProfitAgorot: number;
  paperStoneProfitAgorot: number;
};

export type ItemPricingFields = {
  internalCostAgorot?: number | null;
  architectPriceAgorot?: number | null;
  architectMarkupBp?: number | null;
  architectProfitAgorot?: number | null;
  clientPriceAgorot?: number | null;
  pricingReviewStatus?: "none" | "needs_review" | null;
  clientPriceStale?: boolean | null;
  pricingStatus?: ItemPricingStatus;
};

type PricingFields = ItemPricingFields;

export function resolveItemCommercialPricing(
  pricing?: PricingFields | null,
): ResolvedCommercialPricing | null {
  const internalCostAgorot = pricing?.internalCostAgorot;
  const clientPriceAgorot = pricing?.clientPriceAgorot;
  const architectMarkupBp = pricing?.architectMarkupBp;

  if (
    internalCostAgorot == null ||
    clientPriceAgorot == null ||
    architectMarkupBp == null
  ) {
    return null;
  }

  const commercialMarginAgorot = calculateCommercialMarginAgorot(
    internalCostAgorot,
    clientPriceAgorot,
  );
  const architectProfitAgorot = calculateArchitectProfitFromMarginShare(
    commercialMarginAgorot,
    architectMarkupBp,
  );
  const paperStoneProfitAgorot = calculatePaperStoneProfitFromMarginShare(
    commercialMarginAgorot,
    architectProfitAgorot,
  );

  return {
    internalCostAgorot,
    clientPriceAgorot,
    architectMarkupBp,
    commercialMarginAgorot,
    architectProfitAgorot,
    paperStoneProfitAgorot,
  };
}

export function isItemCommercialPricingComplete(
  pricing?: PricingFields | null,
): boolean {
  const resolved = resolveItemCommercialPricing(pricing);
  return resolved != null && resolved.paperStoneProfitAgorot >= 0;
}

export function getEffectivePricingReviewStatus(
  pricing?: PricingFields | null,
): PricingReviewStatus {
  if (pricing?.pricingReviewStatus === "needs_review") {
    return "needs_review";
  }

  if (pricing?.clientPriceStale) {
    return "needs_review";
  }

  return "none";
}

export function getItemPricingStatus(
  pricing?: PricingFields | null,
): ItemPricingStatus {
  if (!isItemCommercialPricingComplete(pricing)) {
    return "unpriced";
  }

  if (getEffectivePricingReviewStatus(pricing) === "needs_review") {
    return "needs_review";
  }

  return "priced";
}

export function validateAdminCommercialPricingInput(
  input: AdminCommercialPricingInput,
): { ok: true; resolved: ResolvedCommercialPricing } | { ok: false; message: string } {
  const values = [
    input.internalCostAgorot,
    input.clientPriceAgorot,
    input.architectMarkupBp,
  ];

  for (const value of values) {
    if (!Number.isInteger(value) || value < 0) {
      return {
        ok: false,
        message: "ערכי תמחור חייבים להיות מספרים שלמים שאינם שליליים",
      };
    }
  }

  if (input.clientPriceAgorot < input.internalCostAgorot) {
    return {
      ok: false,
      message: "מחיר סופי ללקוח חייב להיות גבוה או שווה למחיר המוצר",
    };
  }

  if (!isValidArchitectMarginShareBasisPoints(input.architectMarkupBp)) {
    return { ok: false, message: "Markup חייב להיות בין 0% ל־100%" };
  }

  const resolved = resolveItemCommercialPricing(input);

  if (!resolved) {
    return { ok: false, message: "ערכי תמחור לא תקינים" };
  }

  if (resolved.paperStoneProfitAgorot < 0) {
    return {
      ok: false,
      message: "מרקאפ האדריכל גבוה מדי עבור המרווח המסחרי",
    };
  }

  return { ok: true, resolved };
}

export function isItemPricingVisibleToRole(
  pricing?: PricingFields | null,
): boolean {
  return getItemPricingStatus(pricing) === "priced";
}

/** @deprecated use AdminCommercialPricingInput */
export type ItemCommercialPricingInput = {
  internalCostAgorot: number;
  architectProfitAgorot: number;
  clientPriceAgorot: number;
};

/** @deprecated use validateAdminCommercialPricingInput */
export function validateItemCommercialPricingInput(
  input: ItemCommercialPricingInput,
): { ok: true } | { ok: false; message: string } {
  return { ok: false, message: "deprecated" };
}
