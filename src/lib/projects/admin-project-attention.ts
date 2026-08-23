import {
  getAdminLayerPricingAttentionFromItemPricing,
  getPricingAttentionFromItemPricing,
  type ProjectPricingAttention,
} from "@/lib/pricing/pricing-attention-utils";
import {
  getAdminPricingRoundPresentation,
  type AdminPricingRoundPresentation,
} from "@/lib/pricing/admin-pricing-round-presentation";
import {
  hasPendingAdminPricingDelivery,
  isAdminPricingReadyToDeliver,
} from "@/lib/pricing/admin-pricing-round";
import type { IProject, IProjectItem } from "@/models/Project";
import { usesLayeredPricing } from "@/lib/projects/project-workspace-gates";

export type { ProjectPricingAttention } from "@/lib/pricing/pricing-attention-utils";
export type { AdminLayerPricingAttention } from "@/lib/pricing/pricing-attention-utils";
export {
  getPricingAttentionFromAdminItems,
  hasPricingAttention as hasLayeredPricingAttention,
  isPricingIncomplete,
  isAdminLayerPricingIncomplete,
  getAdminLayerPricingAttentionFromItemPricing,
} from "@/lib/pricing/pricing-attention-utils";

export type { AdminProjectAttentionReason } from "@/lib/projects/admin-project-attention-labels";
export { ADMIN_PROJECT_ATTENTION_LABELS } from "@/lib/projects/admin-project-attention-labels";
import type { AdminProjectAttentionReason } from "@/lib/projects/admin-project-attention-labels";
import { ADMIN_PROJECT_ATTENTION_LABELS } from "@/lib/projects/admin-project-attention-labels";

export function getProjectPricingAttention(
  items: IProjectItem[],
): ProjectPricingAttention {
  return getPricingAttentionFromItemPricing(items);
}

export function getAdminProjectAttentionReasons(
  project: Pick<
    IProject,
    | "onboardingStatus"
    | "status"
    | "items"
    | "adminPricingRevision"
    | "adminPricingDeliveredRevision"
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
    if (hasPendingAdminPricingDelivery(project)) {
      const adminLayerAttention = getAdminLayerPricingAttentionFromItemPricing(
        project.items,
      );

      if (adminLayerAttention.incompleteItemCount > 0) {
        reasons.push("admin_pricing_incomplete");
      } else if (isAdminPricingReadyToDeliver(project)) {
        reasons.push("pricing_ready_to_deliver");
      }
    }

    const attention = getProjectPricingAttention(project.items);

    if (attention.staleClientPriceCount > 0) {
      reasons.push("stale_client_prices");
    }
  }

  return reasons;
}

export function getAdminProjectAttentionLabels(
  project: Pick<
    IProject,
    | "onboardingStatus"
    | "status"
    | "items"
    | "adminPricingRevision"
    | "adminPricingDeliveredRevision"
  >,
): string[] {
  return getAdminProjectAttentionReasons(project).map(
    (reason) => ADMIN_PROJECT_ATTENTION_LABELS[reason],
  );
}

export const ADMIN_LAYER_INCOMPLETE_PRICING_ELEM_MATCH = {
  $or: [
    { pricing: { $exists: false } },
    { "pricing.internalCostAgorot": { $exists: false } },
    { "pricing.internalCostAgorot": null },
    { "pricing.architectPriceAgorot": { $exists: false } },
    { "pricing.architectPriceAgorot": null },
  ],
} as const;

/** @deprecated Use ADMIN_LAYER_INCOMPLETE_PRICING_ELEM_MATCH for admin workflow */
export const INCOMPLETE_LAYERED_PRICING_ELEM_MATCH = {
  $or: [
    ...ADMIN_LAYER_INCOMPLETE_PRICING_ELEM_MATCH.$or,
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
        $expr: {
          $gt: [
            { $ifNull: ["$adminPricingRevision", 0] },
            { $ifNull: ["$adminPricingDeliveredRevision", 0] },
          ],
        },
      },
      {
        onboardingStatus: "active",
        items: { $elemMatch: { "pricing.clientPriceStale": true } },
      },
    ],
  };
}

export function getAdminPricingRoundPresentationForProject(
  project: Pick<
    IProject,
    | "onboardingStatus"
    | "adminPricingRevision"
    | "adminPricingDeliveredRevision"
    | "items"
  >,
): AdminPricingRoundPresentation | null {
  return getAdminPricingRoundPresentation(project);
}
