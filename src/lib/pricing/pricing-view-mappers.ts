import { formatIlsAgorot } from "@/lib/money/format-ils";
import { basisPointsToPercentageString } from "@/lib/pricing/markup-basis-points";
import { calculateLineTotalAgorot } from "@/lib/pricing/pricing-calculations";
import {
  getItemPricingStatus,
  isItemPricingVisibleToRole,
  resolveItemCommercialPricing,
} from "@/lib/pricing/pricing-commercial-model";
import type { IProject, IProjectItem } from "@/models/Project";
import type {
  AdminPricingTotalsView,
  AdminProjectItemPricingView,
  ArchitectPricingTotalsView,
  ArchitectProjectItemPricingView,
  ClientProjectItemPricingView,
  ProjectPricingSettingsView,
} from "@/types/project-pricing";
import {
  calculateAdminPricingTotals,
  calculateArchitectPricingTotals,
  calculateClientPricingTotals,
} from "@/lib/pricing/pricing-totals";
import {
  getPricingUnavailableReason,
  isAdminProjectPricingEditable,
} from "@/lib/pricing/pricing-gates";
import { usesLayeredPricing } from "@/lib/projects/project-workspace-gates";

function formatOptionalAgorot(value?: number): string | undefined {
  return value == null ? undefined : formatIlsAgorot(value);
}

function mapVatTotalsFormatted(
  totals: Pick<
    AdminPricingTotalsView,
    | "clientSubtotalAgorot"
    | "vatAmountAgorot"
    | "clientTotalInclVatAgorot"
  >,
) {
  return {
    clientSubtotalFormatted: formatOptionalAgorot(totals.clientSubtotalAgorot),
    vatAmountFormatted: formatOptionalAgorot(totals.vatAmountAgorot),
    clientTotalInclVatFormatted: formatOptionalAgorot(
      totals.clientTotalInclVatAgorot,
    ),
    clientTotalFormatted: formatOptionalAgorot(totals.clientSubtotalAgorot),
  };
}

export function mapAdminProjectItemPricingView(
  item: IProjectItem,
  _project?: Pick<IProject, "defaultAdminMarkupBp" | "defaultArchitectMarkupBp">,
): AdminProjectItemPricingView {
  const pricing = item.pricing;
  const pricingStatus = getItemPricingStatus(pricing);
  const resolved = resolveItemCommercialPricing(pricing);
  const hasInternalCost = pricing?.internalCostAgorot != null;
  const hasClientPrice = pricing?.clientPriceAgorot != null;
  const hasArchitectMarkup = pricing?.architectMarkupBp != null;

  return {
    priceVersion: pricing?.priceVersion ?? 0,
    pricingStatus,
    internalCostAgorot: pricing?.internalCostAgorot,
    internalCostFormatted: formatOptionalAgorot(pricing?.internalCostAgorot),
    hasInternalCost,
    clientPriceAgorot: pricing?.clientPriceAgorot,
    clientPriceFormatted: formatOptionalAgorot(pricing?.clientPriceAgorot),
    hasClientPrice,
    architectMarkupBp: pricing?.architectMarkupBp ?? undefined,
    architectMarkupPercent:
      pricing?.architectMarkupBp == null
        ? undefined
        : basisPointsToPercentageString(pricing.architectMarkupBp),
    hasArchitectMarkup,
    commercialMarginAgorot: resolved?.commercialMarginAgorot,
    commercialMarginFormatted: formatOptionalAgorot(resolved?.commercialMarginAgorot),
    hasCommercialMargin: resolved != null && resolved.commercialMarginAgorot >= 0,
    paperStoneProfitAgorot: resolved?.paperStoneProfitAgorot,
    paperStoneProfitFormatted: formatOptionalAgorot(resolved?.paperStoneProfitAgorot),
    hasPaperStoneProfit: resolved != null && resolved.paperStoneProfitAgorot >= 0,
    architectProfitAgorot: resolved?.architectProfitAgorot,
    architectProfitFormatted: formatOptionalAgorot(resolved?.architectProfitAgorot),
    hasArchitectProfit: resolved != null,
    internalCostLineTotalAgorot:
      hasInternalCost && pricing?.internalCostAgorot != null
        ? calculateLineTotalAgorot(pricing.internalCostAgorot, item.quantity)
        : undefined,
    internalCostLineTotalFormatted: formatOptionalAgorot(
      hasInternalCost && pricing?.internalCostAgorot != null
        ? calculateLineTotalAgorot(pricing.internalCostAgorot, item.quantity)
        : undefined,
    ),
    commercialMarginLineTotalAgorot:
      resolved != null
        ? calculateLineTotalAgorot(resolved.commercialMarginAgorot, item.quantity)
        : undefined,
    commercialMarginLineTotalFormatted: formatOptionalAgorot(
      resolved != null
        ? calculateLineTotalAgorot(resolved.commercialMarginAgorot, item.quantity)
        : undefined,
    ),
    paperStoneProfitLineTotalAgorot:
      resolved != null
        ? calculateLineTotalAgorot(resolved.paperStoneProfitAgorot, item.quantity)
        : undefined,
    paperStoneProfitLineTotalFormatted: formatOptionalAgorot(
      resolved != null
        ? calculateLineTotalAgorot(resolved.paperStoneProfitAgorot, item.quantity)
        : undefined,
    ),
    architectProfitLineTotalAgorot:
      resolved != null
        ? calculateLineTotalAgorot(resolved.architectProfitAgorot, item.quantity)
        : undefined,
    architectProfitLineTotalFormatted: formatOptionalAgorot(
      resolved != null
        ? calculateLineTotalAgorot(resolved.architectProfitAgorot, item.quantity)
        : undefined,
    ),
    clientLineTotalAgorot:
      hasClientPrice && pricing?.clientPriceAgorot != null
        ? calculateLineTotalAgorot(pricing.clientPriceAgorot, item.quantity)
        : undefined,
    clientLineTotalFormatted: formatOptionalAgorot(
      hasClientPrice && pricing?.clientPriceAgorot != null
        ? calculateLineTotalAgorot(pricing.clientPriceAgorot, item.quantity)
        : undefined,
    ),
  };
}

export function mapArchitectProjectItemPricingView(
  item: IProjectItem,
  _project?: Pick<IProject, "defaultArchitectMarkupBp">,
): ArchitectProjectItemPricingView {
  const pricing = item.pricing;
  const pricingStatus = getItemPricingStatus(pricing);
  const visible = isItemPricingVisibleToRole(pricing);
  const resolved = visible ? resolveItemCommercialPricing(pricing) : null;

  return {
    priceVersion: pricing?.priceVersion ?? 0,
    pricingStatus,
    architectProfitAgorot: resolved?.architectProfitAgorot,
    architectProfitFormatted: formatOptionalAgorot(resolved?.architectProfitAgorot),
    hasArchitectProfit: resolved != null,
    architectProfitLineTotalAgorot:
      resolved != null
        ? calculateLineTotalAgorot(resolved.architectProfitAgorot, item.quantity)
        : undefined,
    architectProfitLineTotalFormatted: formatOptionalAgorot(
      resolved != null
        ? calculateLineTotalAgorot(resolved.architectProfitAgorot, item.quantity)
        : undefined,
    ),
    clientPriceAgorot: resolved?.clientPriceAgorot,
    clientPriceFormatted: formatOptionalAgorot(resolved?.clientPriceAgorot),
    hasClientPrice: resolved != null,
    clientLineTotalAgorot:
      resolved != null
        ? calculateLineTotalAgorot(resolved.clientPriceAgorot, item.quantity)
        : undefined,
    clientLineTotalFormatted: formatOptionalAgorot(
      resolved != null
        ? calculateLineTotalAgorot(resolved.clientPriceAgorot, item.quantity)
        : undefined,
    ),
  };
}

export function mapClientProjectItemPricingView(
  item: IProjectItem,
): ClientProjectItemPricingView {
  const pricing = item.pricing;
  const pricingStatus = getItemPricingStatus(pricing);
  const resolved = isItemPricingVisibleToRole(pricing)
    ? resolveItemCommercialPricing(pricing)
    : null;

  return {
    pricingStatus,
    clientPriceAgorot: resolved?.clientPriceAgorot,
    clientPriceFormatted: formatOptionalAgorot(resolved?.clientPriceAgorot),
    hasClientPrice: resolved != null,
    clientLineTotalAgorot:
      resolved != null
        ? calculateLineTotalAgorot(resolved.clientPriceAgorot, item.quantity)
        : undefined,
    clientLineTotalFormatted: formatOptionalAgorot(
      resolved != null
        ? calculateLineTotalAgorot(resolved.clientPriceAgorot, item.quantity)
        : undefined,
    ),
  };
}

export function mapProjectPricingSettingsView(
  project: Pick<IProject, "onboardingStatus" | "status">,
): ProjectPricingSettingsView {
  return {
    isAdminPricingEditable: isAdminProjectPricingEditable(project),
    adminPricingUnavailableReason: getPricingUnavailableReason(project, "admin"),
    usesLayeredPricing: usesLayeredPricing(project),
  };
}

export function mapAdminPricingTotalsView(
  items: IProjectItem[],
): AdminPricingTotalsView {
  const totals = calculateAdminPricingTotals(items);
  return {
    ...totals,
    internalCostTotalFormatted: formatOptionalAgorot(totals.internalCostTotalAgorot),
    commercialMarginTotalFormatted: formatOptionalAgorot(
      totals.commercialMarginTotalAgorot,
    ),
    paperStoneProfitTotalFormatted: formatOptionalAgorot(
      totals.paperStoneProfitTotalAgorot,
    ),
    architectProfitTotalFormatted: formatOptionalAgorot(
      totals.architectProfitTotalAgorot,
    ),
    ...mapVatTotalsFormatted(totals),
  };
}

export function mapArchitectPricingTotalsView(
  items: IProjectItem[],
): ArchitectPricingTotalsView {
  const totals = calculateArchitectPricingTotals(items);
  return {
    ...totals,
    architectProfitTotalFormatted: formatOptionalAgorot(
      totals.architectProfitTotalAgorot,
    ),
    ...mapVatTotalsFormatted(totals),
  };
}

export function mapClientPricingTotalsView(items: IProjectItem[]) {
  const totals = calculateClientPricingTotals(items);
  return {
    ...totals,
    ...mapVatTotalsFormatted(totals),
  };
}
