import type { IProject } from "@/models/Project";
import {
  getAdminPricingDeliveredRevision,
  getAdminPricingRevision,
  hasPendingAdminPricingDelivery,
  isAdminPricingReadyToDeliver,
} from "@/lib/pricing/admin-pricing-round";
import {
  getAdminLayerPricingAttentionFromItemPricing,
  type AdminLayerPricingAttention,
} from "@/lib/pricing/pricing-attention-utils";
import { usesLayeredPricing } from "@/lib/projects/project-workspace-gates";

export type AdminPricingRoundPresentation = {
  adminPricingRevision: number;
  adminPricingDeliveredRevision: number;
  hasPendingAdminPricingDelivery: boolean;
  isAdminPricingReadyToDeliver: boolean;
  adminLayerAttention: AdminLayerPricingAttention;
  statusMessage: string;
  listBadgeLabel: string | null;
  showDeliveryButton: boolean;
};

function formatItemCountLabel(count: number, singular: string, plural: string): string {
  if (count === 1) {
    return `מוצר אחד ${singular}`;
  }

  return `${count} ${plural}`;
}

export function getAdminPricingRoundPresentation(
  project: Pick<
    IProject,
    | "onboardingStatus"
    | "adminPricingRevision"
    | "adminPricingDeliveredRevision"
    | "items"
  >,
): AdminPricingRoundPresentation | null {
  if (!usesLayeredPricing(project)) {
    return null;
  }

  const adminPricingRevision = getAdminPricingRevision(project);
  const adminPricingDeliveredRevision = getAdminPricingDeliveredRevision(project);
  const pendingDelivery = hasPendingAdminPricingDelivery(project);
  const adminLayerAttention = getAdminLayerPricingAttentionFromItemPricing(
    project.items,
  );
  const readyToDeliver = isAdminPricingReadyToDeliver(project);

  let statusMessage = "התמחור האחרון נשלח לאדריכל.";
  let listBadgeLabel: string | null = null;

  if (pendingDelivery) {
    if (adminLayerAttention.incompleteItemCount > 0) {
      statusMessage = `יש ${formatItemCountLabel(
        adminLayerAttention.incompleteItemCount,
        "ממתין לתמחור",
        "מוצרים שטרם תומחרו",
      )}.`;
      listBadgeLabel = formatItemCountLabel(
        adminLayerAttention.incompleteItemCount,
        "ממתין לתמחור",
        "מוצרים ממתינים לתמחור",
      );
    } else {
      statusMessage = "כל המוצרים תומחרו. ניתן לשלוח את התמחור לאדריכל.";
      listBadgeLabel = "תמחור מוכן לשליחה";
    }
  }

  return {
    adminPricingRevision,
    adminPricingDeliveredRevision,
    hasPendingAdminPricingDelivery: pendingDelivery,
    isAdminPricingReadyToDeliver: readyToDeliver,
    adminLayerAttention,
    statusMessage,
    listBadgeLabel,
    showDeliveryButton: readyToDeliver,
  };
}
