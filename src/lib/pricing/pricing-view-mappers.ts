import { formatIlsAgorot } from "@/lib/money/format-ils";
import { basisPointsToPercentageString } from "@/lib/pricing/markup-basis-points";
import { calculateLineTotalAgorot } from "@/lib/pricing/pricing-calculations";
import {
  getEffectiveAdminMarkupBp,
  getEffectiveArchitectMarkupBp,
  hasAdminMarkupOverride,
  hasArchitectMarkupOverride,
} from "@/lib/pricing/pricing-inheritance";
import type { IProject, IProjectItem } from "@/models/Project";
import type {
  AdminPricingTotalsView,
  AdminProjectItemPricingView,
  ArchitectPricingTotalsView,
  ArchitectProjectItemPricingView,
  ArchitectProjectPricingSettingsView,
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
  isArchitectProjectPricingEditable,
} from "@/lib/pricing/pricing-gates";
import { usesLayeredPricing } from "@/lib/projects/project-workspace-gates";

function formatOptionalAgorot(value?: number): string | undefined {
  return value == null ? undefined : formatIlsAgorot(value);
}

export function mapAdminProjectItemPricingView(
  item: IProjectItem,
  project: Pick<IProject, "defaultAdminMarkupBp" | "defaultArchitectMarkupBp">,
): AdminProjectItemPricingView {
  const pricing = item.pricing;
  const effectiveAdminMarkupBp = getEffectiveAdminMarkupBp(item, project);
  const effectiveArchitectMarkupBp = getEffectiveArchitectMarkupBp(item, project);
  const hasInternalCost = pricing?.internalCostAgorot != null;
  const hasArchitectPrice = pricing?.architectPriceAgorot != null;
  const hasClientPrice = pricing?.clientPriceAgorot != null;

  return {
    priceVersion: pricing?.priceVersion ?? 0,
    clientPriceStale: pricing?.clientPriceStale ?? false,
    internalCostAgorot: pricing?.internalCostAgorot,
    internalCostFormatted: formatOptionalAgorot(pricing?.internalCostAgorot),
    hasInternalCost,
    adminMarkupBp: effectiveAdminMarkupBp ?? undefined,
    adminMarkupPercent:
      effectiveAdminMarkupBp == null
        ? undefined
        : basisPointsToPercentageString(effectiveAdminMarkupBp),
    usesProjectAdminMarkup: !hasAdminMarkupOverride(pricing),
    architectPriceAgorot: pricing?.architectPriceAgorot,
    architectPriceFormatted: formatOptionalAgorot(pricing?.architectPriceAgorot),
    hasArchitectPrice,
    architectLineTotalAgorot:
      hasArchitectPrice && pricing?.architectPriceAgorot != null
        ? calculateLineTotalAgorot(pricing.architectPriceAgorot, item.quantity)
        : undefined,
    architectLineTotalFormatted: formatOptionalAgorot(
      hasArchitectPrice && pricing?.architectPriceAgorot != null
        ? calculateLineTotalAgorot(pricing.architectPriceAgorot, item.quantity)
        : undefined,
    ),
    architectMarkupBp: effectiveArchitectMarkupBp ?? undefined,
    architectMarkupPercent:
      effectiveArchitectMarkupBp == null
        ? undefined
        : basisPointsToPercentageString(effectiveArchitectMarkupBp),
    usesProjectArchitectMarkup: !hasArchitectMarkupOverride(pricing),
    clientPriceAgorot: pricing?.clientPriceAgorot,
    clientPriceFormatted: formatOptionalAgorot(pricing?.clientPriceAgorot),
    hasClientPrice,
    clientLineTotalAgorot:
      hasClientPrice && pricing?.clientPriceAgorot != null
        ? calculateLineTotalAgorot(pricing.clientPriceAgorot, item.quantity)
        : undefined,
    clientLineTotalFormatted: formatOptionalAgorot(
      hasClientPrice && pricing?.clientPriceAgorot != null
        ? calculateLineTotalAgorot(pricing.clientPriceAgorot, item.quantity)
        : undefined,
    ),
    internalCostLineTotalAgorot:
      hasInternalCost && pricing?.internalCostAgorot != null
        ? calculateLineTotalAgorot(pricing.internalCostAgorot, item.quantity)
        : undefined,
    internalCostLineTotalFormatted: formatOptionalAgorot(
      hasInternalCost && pricing?.internalCostAgorot != null
        ? calculateLineTotalAgorot(pricing.internalCostAgorot, item.quantity)
        : undefined,
    ),
  };
}

export function mapArchitectProjectItemPricingView(
  item: IProjectItem,
  project: Pick<IProject, "defaultArchitectMarkupBp">,
): ArchitectProjectItemPricingView {
  const pricing = item.pricing;
  const effectiveArchitectMarkupBp = getEffectiveArchitectMarkupBp(item, project);
  const hasArchitectPrice = pricing?.architectPriceAgorot != null;
  const hasClientPrice = pricing?.clientPriceAgorot != null;

  return {
    priceVersion: pricing?.priceVersion ?? 0,
    clientPriceStale: pricing?.clientPriceStale ?? false,
    architectPriceAgorot: pricing?.architectPriceAgorot,
    architectPriceFormatted: formatOptionalAgorot(pricing?.architectPriceAgorot),
    hasArchitectPrice,
    architectLineTotalAgorot:
      hasArchitectPrice && pricing?.architectPriceAgorot != null
        ? calculateLineTotalAgorot(pricing.architectPriceAgorot, item.quantity)
        : undefined,
    architectLineTotalFormatted: formatOptionalAgorot(
      hasArchitectPrice && pricing?.architectPriceAgorot != null
        ? calculateLineTotalAgorot(pricing.architectPriceAgorot, item.quantity)
        : undefined,
    ),
    architectMarkupBp: effectiveArchitectMarkupBp ?? undefined,
    architectMarkupPercent:
      effectiveArchitectMarkupBp == null
        ? undefined
        : basisPointsToPercentageString(effectiveArchitectMarkupBp),
    usesProjectArchitectMarkup: !hasArchitectMarkupOverride(pricing),
    clientPriceAgorot: pricing?.clientPriceAgorot,
    clientPriceFormatted: formatOptionalAgorot(pricing?.clientPriceAgorot),
    hasClientPrice,
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

export function mapClientProjectItemPricingView(
  item: IProjectItem,
): ClientProjectItemPricingView {
  const pricing = item.pricing;
  const hasClientPrice =
    pricing?.clientPriceAgorot != null && !pricing.clientPriceStale;

  return {
    clientPriceAgorot: hasClientPrice ? pricing?.clientPriceAgorot : undefined,
    clientPriceFormatted: formatOptionalAgorot(
      hasClientPrice ? pricing?.clientPriceAgorot : undefined,
    ),
    hasClientPrice,
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

export function mapArchitectProjectPricingSettingsView(
  project: Pick<
    IProject,
    "defaultArchitectMarkupBp" | "onboardingStatus" | "status"
  >,
): ArchitectProjectPricingSettingsView {
  return {
    defaultArchitectMarkupBp: project.defaultArchitectMarkupBp,
    defaultArchitectMarkupPercent:
      project.defaultArchitectMarkupBp == null
        ? undefined
        : basisPointsToPercentageString(project.defaultArchitectMarkupBp),
    isArchitectPricingEditable: isArchitectProjectPricingEditable(project),
    architectPricingUnavailableReason: getPricingUnavailableReason(
      project,
      "architect",
    ),
    usesLayeredPricing: usesLayeredPricing(project),
  };
}

export function mapProjectPricingSettingsView(
  project: Pick<
    IProject,
    | "defaultAdminMarkupBp"
    | "defaultArchitectMarkupBp"
    | "onboardingStatus"
    | "status"
  >,
): ProjectPricingSettingsView {
  return {
    defaultAdminMarkupBp: project.defaultAdminMarkupBp,
    defaultAdminMarkupPercent:
      project.defaultAdminMarkupBp == null
        ? undefined
        : basisPointsToPercentageString(project.defaultAdminMarkupBp),
    defaultArchitectMarkupBp: project.defaultArchitectMarkupBp,
    defaultArchitectMarkupPercent:
      project.defaultArchitectMarkupBp == null
        ? undefined
        : basisPointsToPercentageString(project.defaultArchitectMarkupBp),
    isAdminPricingEditable: isAdminProjectPricingEditable(project),
    isArchitectPricingEditable: isArchitectProjectPricingEditable(project),
    adminPricingUnavailableReason: getPricingUnavailableReason(project, "admin"),
    architectPricingUnavailableReason: getPricingUnavailableReason(
      project,
      "architect",
    ),
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
    architectTotalFormatted: formatOptionalAgorot(totals.architectTotalAgorot),
    clientTotalFormatted: formatOptionalAgorot(totals.clientTotalAgorot),
  };
}

export function mapArchitectPricingTotalsView(
  items: IProjectItem[],
): ArchitectPricingTotalsView {
  const totals = calculateArchitectPricingTotals(items);
  return {
    ...totals,
    architectTotalFormatted: formatOptionalAgorot(totals.architectTotalAgorot),
    clientTotalFormatted: formatOptionalAgorot(totals.clientTotalAgorot),
  };
}

export function mapClientPricingTotalsView(items: IProjectItem[]) {
  const totals = calculateClientPricingTotals(items);
  return {
    ...totals,
    clientTotalFormatted: formatOptionalAgorot(totals.clientTotalAgorot),
  };
}
