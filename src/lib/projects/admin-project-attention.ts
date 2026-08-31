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
import {
  ADMIN_WORKFLOW_ATTENTION_STATUSES,
  getAdminWorkflowAttentionSummary,
  projectHasAdminWorkflowAttention,
  type WorkflowAttentionSummaryLine,
} from "@/lib/project-items/project-item-workflow-attention";
import type { AdminProjectAttentionReason } from "@/lib/projects/admin-project-attention-labels";
import { ADMIN_PROJECT_ATTENTION_LABELS } from "@/lib/projects/admin-project-attention-labels";

export type { WorkflowAttentionSummaryLine };
export { getAdminWorkflowAttentionSummary };

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

    if (attention.needsReviewItemCount > 0) {
      reasons.push("stale_client_prices");
    }
  }

  if (projectHasAdminWorkflowAttention(project.items)) {
    reasons.push("product_workflow_attention");
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
    { "pricing.clientPriceAgorot": { $exists: false } },
    { "pricing.clientPriceAgorot": null },
    { "pricing.architectMarkupBp": { $exists: false } },
    { "pricing.architectMarkupBp": null },
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
        items: {
          $elemMatch: {
            $or: [
              { "pricing.pricingReviewStatus": "needs_review" },
              { "pricing.clientPriceStale": true },
            ],
          },
        },
      },
      {
        items: {
          $elemMatch: {
            status: { $in: [...ADMIN_WORKFLOW_ATTENTION_STATUSES] },
          },
        },
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
