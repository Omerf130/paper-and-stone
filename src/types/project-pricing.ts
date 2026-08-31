import type { ItemPricingStatus } from "@/lib/pricing/pricing-commercial-model";

export type ProjectItemPricingViewBase = {
  priceVersion: number;
  pricingStatus: ItemPricingStatus;
};

export type AdminProjectItemPricingView = ProjectItemPricingViewBase & {
  internalCostAgorot?: number;
  internalCostFormatted?: string;
  hasInternalCost: boolean;
  clientPriceAgorot?: number;
  clientPriceFormatted?: string;
  hasClientPrice: boolean;
  architectMarkupBp?: number;
  architectMarkupPercent?: string;
  hasArchitectMarkup: boolean;
  commercialMarginAgorot?: number;
  commercialMarginFormatted?: string;
  hasCommercialMargin: boolean;
  paperStoneProfitAgorot?: number;
  paperStoneProfitFormatted?: string;
  hasPaperStoneProfit: boolean;
  architectProfitAgorot?: number;
  architectProfitFormatted?: string;
  hasArchitectProfit: boolean;
  internalCostLineTotalAgorot?: number;
  internalCostLineTotalFormatted?: string;
  commercialMarginLineTotalAgorot?: number;
  commercialMarginLineTotalFormatted?: string;
  paperStoneProfitLineTotalAgorot?: number;
  paperStoneProfitLineTotalFormatted?: string;
  architectProfitLineTotalAgorot?: number;
  architectProfitLineTotalFormatted?: string;
  clientLineTotalAgorot?: number;
  clientLineTotalFormatted?: string;
};

export type ArchitectProjectItemPricingView = ProjectItemPricingViewBase & {
  architectProfitAgorot?: number;
  architectProfitFormatted?: string;
  hasArchitectProfit: boolean;
  architectProfitLineTotalAgorot?: number;
  architectProfitLineTotalFormatted?: string;
  clientPriceAgorot?: number;
  clientPriceFormatted?: string;
  hasClientPrice: boolean;
  clientLineTotalAgorot?: number;
  clientLineTotalFormatted?: string;
};

export type ClientProjectItemPricingView = {
  pricingStatus: ItemPricingStatus;
  clientPriceAgorot?: number;
  clientPriceFormatted?: string;
  hasClientPrice: boolean;
  clientLineTotalAgorot?: number;
  clientLineTotalFormatted?: string;
};

export type PricingTotalsView = {
  pricedItemCount: number;
  unpricedItemCount: number;
  needsReviewItemCount: number;
  isComplete: boolean;
};

export type PricingVatTotalsView = {
  clientSubtotalAgorot?: number;
  clientSubtotalFormatted?: string;
  vatRateBasisPoints?: number;
  vatAmountAgorot?: number;
  vatAmountFormatted?: string;
  clientTotalInclVatAgorot?: number;
  clientTotalInclVatFormatted?: string;
};

export type AdminPricingTotalsView = PricingTotalsView &
  PricingVatTotalsView & {
    internalCostTotalAgorot?: number;
    internalCostTotalFormatted?: string;
    commercialMarginTotalAgorot?: number;
    commercialMarginTotalFormatted?: string;
    paperStoneProfitTotalAgorot?: number;
    paperStoneProfitTotalFormatted?: string;
    architectProfitTotalAgorot?: number;
    architectProfitTotalFormatted?: string;
    /** @deprecated use clientSubtotalAgorot */
    clientTotalAgorot?: number;
    /** @deprecated use clientSubtotalFormatted */
    clientTotalFormatted?: string;
  };

export type ArchitectPricingTotalsView = PricingTotalsView &
  PricingVatTotalsView & {
    architectProfitTotalAgorot?: number;
    architectProfitTotalFormatted?: string;
    /** @deprecated use clientSubtotalAgorot */
    clientTotalAgorot?: number;
    /** @deprecated use clientSubtotalFormatted */
    clientTotalFormatted?: string;
  };

export type ClientPricingTotalsView = PricingTotalsView &
  PricingVatTotalsView & {
    /** @deprecated use clientSubtotalAgorot */
    clientTotalAgorot?: number;
    /** @deprecated use clientSubtotalFormatted */
    clientTotalFormatted?: string;
  };

export type ProjectPricingSettingsView = {
  isAdminPricingEditable: boolean;
  adminPricingUnavailableReason?: string;
  usesLayeredPricing: boolean;
};
