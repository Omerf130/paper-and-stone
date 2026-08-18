import type { IProject, IProjectItem } from "@/models/Project";
import type { ProjectPricingAttention } from "@/lib/pricing/pricing-attention-utils";
import {
  getPricingAttentionFromItemPricing,
} from "@/lib/pricing/pricing-attention-utils";
import { usesLayeredPricing } from "@/lib/projects/project-workspace-gates";

export type { ProjectPricingAttention } from "@/lib/pricing/pricing-attention-utils";
export {
  getPricingAttentionFromAdminItems,
  hasPricingAttention as hasLayeredPricingAttention,
  isPricingIncomplete,
} from "@/lib/pricing/pricing-attention-utils";

export type AdminProjectAttentionReason =
  | "pending_onboarding"
  | "commercial_review"
  | "unpriced_items"
  | "stale_client_prices";

export const ADMIN_PROJECT_ATTENTION_LABELS: Record<
  AdminProjectAttentionReason,
  string
> = {
  pending_onboarding: "ממתין לאישור פתיחה",
  commercial_review: "ממתין לבדיקה מסחרית",
  unpriced_items: "מוצרים שטרם תומחרו",
  stale_client_prices: "מחירי לקוח דורשים בדיקה",
};

export function getProjectPricingAttention(
  items: IProjectItem[],
): ProjectPricingAttention {
  return getPricingAttentionFromItemPricing(items);
}

export function getAdminProjectAttentionReasons(
  project: Pick<
    IProject,
    "onboardingStatus" | "status" | "items"
  >,
): AdminProjectAttentionReason[] {
  const reasons: AdminProjectAttentionReason[] = [];

  if (project.onboardingStatus === "pending_approval") {
    reasons.push("pending_onboarding");
  }

  if (project.status === "submitted") {
    reasons.push("commercial_review");
  }

  if (usesLayeredPricing(project)) {
    const attention = getProjectPricingAttention(project.items);

    if (attention.incompleteItemCount > 0) {
      reasons.push("unpriced_items");
    }

    if (attention.staleClientPriceCount > 0) {
      reasons.push("stale_client_prices");
    }
  }

  return reasons;
}

export function getAdminProjectAttentionLabels(
  project: Pick<IProject, "onboardingStatus" | "status" | "items">,
): string[] {
  return getAdminProjectAttentionReasons(project).map(
    (reason) => ADMIN_PROJECT_ATTENTION_LABELS[reason],
  );
}

export const INCOMPLETE_LAYERED_PRICING_ELEM_MATCH = {
  $or: [
    { pricing: { $exists: false } },
    { "pricing.internalCostAgorot": { $exists: false } },
    { "pricing.internalCostAgorot": null },
    { "pricing.architectPriceAgorot": { $exists: false } },
    { "pricing.architectPriceAgorot": null },
    { "pricing.clientPriceAgorot": { $exists: false } },
    { "pricing.clientPriceAgorot": null },
  ],
} as const;

export function buildAdminProjectAttentionFilter(): Record<string, unknown> {
  return {
    $or: [
      { onboardingStatus: "pending_approval" },
      { status: "submitted" },
      {
        onboardingStatus: "active",
        items: { $elemMatch: INCOMPLETE_LAYERED_PRICING_ELEM_MATCH },
      },
      {
        onboardingStatus: "active",
        items: { $elemMatch: { "pricing.clientPriceStale": true } },
      },
    ],
  };
}
