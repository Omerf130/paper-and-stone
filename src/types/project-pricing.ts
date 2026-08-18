export type ProjectItemPricingViewBase = {
  priceVersion: number;
  clientPriceStale: boolean;
};

export type AdminProjectItemPricingView = ProjectItemPricingViewBase & {
  internalCostAgorot?: number;
  internalCostFormatted?: string;
  hasInternalCost: boolean;
  adminMarkupBp?: number;
  adminMarkupPercent?: string;
  usesProjectAdminMarkup: boolean;
  architectPriceAgorot?: number;
  architectPriceFormatted?: string;
  hasArchitectPrice: boolean;
  architectLineTotalAgorot?: number;
  architectLineTotalFormatted?: string;
  architectMarkupBp?: number;
  architectMarkupPercent?: string;
  usesProjectArchitectMarkup: boolean;
  clientPriceAgorot?: number;
  clientPriceFormatted?: string;
  hasClientPrice: boolean;
  clientLineTotalAgorot?: number;
  clientLineTotalFormatted?: string;
  internalCostLineTotalAgorot?: number;
  internalCostLineTotalFormatted?: string;
};

export type ArchitectProjectItemPricingView = ProjectItemPricingViewBase & {
  architectPriceAgorot?: number;
  architectPriceFormatted?: string;
  hasArchitectPrice: boolean;
  architectLineTotalAgorot?: number;
  architectLineTotalFormatted?: string;
  architectMarkupBp?: number;
  architectMarkupPercent?: string;
  usesProjectArchitectMarkup: boolean;
  clientPriceAgorot?: number;
  clientPriceFormatted?: string;
  hasClientPrice: boolean;
  clientLineTotalAgorot?: number;
  clientLineTotalFormatted?: string;
};

export type ClientProjectItemPricingView = {
  clientPriceAgorot?: number;
  clientPriceFormatted?: string;
  hasClientPrice: boolean;
  clientLineTotalAgorot?: number;
  clientLineTotalFormatted?: string;
};

export type PricingTotalsView = {
  pricedItemCount: number;
  unpricedItemCount: number;
  staleItemCount: number;
  isComplete: boolean;
};

export type AdminPricingTotalsView = PricingTotalsView & {
  internalCostTotalAgorot?: number;
  internalCostTotalFormatted?: string;
  architectTotalAgorot?: number;
  architectTotalFormatted?: string;
  clientTotalAgorot?: number;
  clientTotalFormatted?: string;
};

export type ArchitectPricingTotalsView = PricingTotalsView & {
  architectTotalAgorot?: number;
  architectTotalFormatted?: string;
  clientTotalAgorot?: number;
  clientTotalFormatted?: string;
};

export type ClientPricingTotalsView = PricingTotalsView & {
  clientTotalAgorot?: number;
  clientTotalFormatted?: string;
};

export type ArchitectProjectPricingSettingsView = {
  defaultArchitectMarkupBp?: number;
  defaultArchitectMarkupPercent?: string;
  isArchitectPricingEditable: boolean;
  architectPricingUnavailableReason?: string;
  usesLayeredPricing: boolean;
};

export type ProjectPricingSettingsView = {
  defaultAdminMarkupBp?: number;
  defaultAdminMarkupPercent?: string;
  defaultArchitectMarkupBp?: number;
  defaultArchitectMarkupPercent?: string;
  isAdminPricingEditable: boolean;
  isArchitectPricingEditable: boolean;
  adminPricingUnavailableReason?: string;
  architectPricingUnavailableReason?: string;
  usesLayeredPricing: boolean;
};
