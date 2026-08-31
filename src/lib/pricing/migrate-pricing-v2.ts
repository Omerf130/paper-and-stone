import type { IProjectItemPricing } from "@/models/Project";
import {
  calculateArchitectProfitAgorot,
  calculateClientPriceFromArchitectMarkup,
} from "@/lib/pricing/pricing-calculations";
import {
  isValidArchitectMarginShareBasisPoints,
  isValidMarkupBasisPoints,
} from "@/lib/pricing/markup-basis-points";
import { resolveItemCommercialPricing } from "@/lib/pricing/pricing-commercial-model";

export type MigratePricingV2Result = {
  projectsScanned: number;
  itemsScanned: number;
  itemsMigrated: number;
  itemsSkipped: number;
};

function deriveArchitectMarkupBpFromMarginSplit(input: {
  internalCostAgorot: number;
  clientPriceAgorot: number;
  architectProfitAgorot: number;
}): number | null {
  const margin = input.clientPriceAgorot - input.internalCostAgorot;
  if (margin <= 0 || input.architectProfitAgorot < 0) {
    return null;
  }

  if (input.architectProfitAgorot > margin) {
    return null;
  }

  const markupBp = Math.round(
    (input.architectProfitAgorot * 10_000) / margin,
  );
  return isValidArchitectMarginShareBasisPoints(markupBp) ? markupBp : null;
}

function deriveClientPriceFromIntermediateV2(input: {
  architectPriceAgorot: number;
  architectMarkupBp: number;
}): number | null {
  if (!isValidMarkupBasisPoints(input.architectMarkupBp)) {
    return null;
  }

  return calculateClientPriceFromArchitectMarkup(
    input.architectPriceAgorot,
    input.architectMarkupBp,
  );
}

export function migrateItemPricingToV2(
  pricing: IProjectItemPricing | undefined | null,
): { pricing: IProjectItemPricing | undefined; migrated: boolean } {
  if (!pricing) {
    return { pricing: undefined, migrated: false };
  }

  let migrated = false;
  const next: IProjectItemPricing = {
    ...pricing,
    priceVersion: pricing.priceVersion ?? 0,
  };

  if (next.pricingReviewStatus == null) {
    next.pricingReviewStatus = next.clientPriceStale ? "needs_review" : "none";
    migrated = true;
  }

  const hasStoredClientPrice = next.clientPriceAgorot != null;
  const hasIntermediateArchitectBase =
    next.architectPriceAgorot != null && next.architectMarkupBp != null;

  if (!hasStoredClientPrice && hasIntermediateArchitectBase) {
    const derivedClientPrice = deriveClientPriceFromIntermediateV2({
      architectPriceAgorot: next.architectPriceAgorot!,
      architectMarkupBp: next.architectMarkupBp!,
    });

    if (derivedClientPrice != null) {
      next.clientPriceAgorot = derivedClientPrice;
      migrated = true;
    }
  }

  if (
    next.architectMarkupBp == null &&
    next.internalCostAgorot != null &&
    next.clientPriceAgorot != null &&
    next.architectProfitAgorot != null
  ) {
    const derivedMarkup = deriveArchitectMarkupBpFromMarginSplit({
      internalCostAgorot: next.internalCostAgorot,
      clientPriceAgorot: next.clientPriceAgorot,
      architectProfitAgorot: next.architectProfitAgorot,
    });

    if (derivedMarkup != null) {
      next.architectMarkupBp = derivedMarkup;
      migrated = true;
    }
  }

  const resolved = resolveItemCommercialPricing(next);
  if (resolved != null) {
    if (next.architectProfitAgorot !== resolved.architectProfitAgorot) {
      next.architectProfitAgorot = resolved.architectProfitAgorot;
      migrated = true;
    }
  }

  if (pricing.priceVersion == null) {
    migrated = true;
  }

  return { pricing: next, migrated };
}

export async function migratePricingV2(): Promise<MigratePricingV2Result> {
  const { connectDB } = await import("@/lib/db/mongoose");
  const Project = (await import("@/models/Project")).default;

  await connectDB();

  const projects = await Project.find({
    "items.pricing": { $exists: true },
  }).select("_id items");

  let itemsScanned = 0;
  let itemsMigrated = 0;
  let itemsSkipped = 0;

  for (const project of projects) {
    let projectDirty = false;

    for (const item of project.items) {
      if (!item.pricing) {
        continue;
      }

      itemsScanned += 1;
      const { pricing, migrated } = migrateItemPricingToV2(item.pricing);

      if (!migrated || !pricing) {
        itemsSkipped += 1;
        continue;
      }

      item.pricing = pricing;
      projectDirty = true;
      itemsMigrated += 1;
    }

    if (projectDirty) {
      await project.save();
    }
  }

  return {
    projectsScanned: projects.length,
    itemsScanned,
    itemsMigrated,
    itemsSkipped,
  };
}

export {
  calculateArchitectProfitAgorot,
  calculateClientPriceFromArchitectMarkup,
};
