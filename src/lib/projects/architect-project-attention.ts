import type { ProjectOnboardingStatus, ProjectStatus } from "@/types/project";
import {
  getArchitectPricingAttentionFromItems,
} from "@/lib/pricing/architect-pricing-attention";

export type { ArchitectPricingAttention } from "@/lib/pricing/architect-pricing-attention";
export {
  getArchitectPricingAttentionFromItems,
  hasArchitectPricingAttention,
  isArchitectPricingIncomplete,
} from "@/lib/pricing/architect-pricing-attention";

function usesArchitectLayeredPricing(
  project: Pick<{ onboardingStatus?: ProjectOnboardingStatus | null }, "onboardingStatus">,
): boolean {
  return project.onboardingStatus != null;
}

export type ArchitectProjectAttentionReason =
  | "pending_onboarding"
  | "onboarding_rejected"
  | "changes_requested"
  | "submitted_review"
  | "commercial_dirty"
  | "stale_client_prices"
  | "incomplete_client_pricing";

export const ARCHITECT_PROJECT_ATTENTION_LABELS: Record<
  ArchitectProjectAttentionReason,
  string
> = {
  pending_onboarding: "ממתין לאישור פתיחה",
  onboarding_rejected: "פרויקט נדחה באישור פתיחה",
  changes_requested: "האדמין ביקש שינויים",
  submitted_review: "ממתין לבדיקה מסחרית",
  commercial_dirty: "יש שינויים שטרם נשלחו לבדיקה",
  stale_client_prices: "מחיר לקוח דורש בדיקה",
  incomplete_client_pricing: "יש להשלים תמחור ללקוח",
};

type ArchitectAttentionProject = {
  onboardingStatus?: ProjectOnboardingStatus | null;
  status: ProjectStatus;
  commercialDirty?: boolean;
  items: Array<{
    architectPricing?: {
      architectPriceAgorot?: number;
      clientPriceAgorot?: number;
      clientPriceStale?: boolean;
    };
  }>;
};

export function getArchitectProjectAttentionReasons(
  project: ArchitectAttentionProject,
): ArchitectProjectAttentionReason[] {
  const reasons: ArchitectProjectAttentionReason[] = [];

  if (project.onboardingStatus === "pending_approval") {
    reasons.push("pending_onboarding");
  }

  if (project.onboardingStatus === "rejected") {
    reasons.push("onboarding_rejected");
  }

  if (project.status === "changes_requested") {
    reasons.push("changes_requested");
  }

  if (project.status === "submitted") {
    reasons.push("submitted_review");
  }

  if (
    project.status === "approved" &&
    usesArchitectLayeredPricing(project) &&
    project.commercialDirty === true
  ) {
    reasons.push("commercial_dirty");
  }

  if (usesArchitectLayeredPricing(project)) {
    const attention = getArchitectPricingAttentionFromItems(project.items);

    if (attention.staleClientPriceCount > 0) {
      reasons.push("stale_client_prices");
    }

    if (attention.incompleteItemCount > 0) {
      reasons.push("incomplete_client_pricing");
    }
  }

  return reasons;
}

export function getArchitectProjectAttentionLabels(
  project: ArchitectAttentionProject,
): string[] {
  return getArchitectProjectAttentionReasons(project).map(
    (reason) => ARCHITECT_PROJECT_ATTENTION_LABELS[reason],
  );
}

export function getArchitectProjectActionHint(
  project: ArchitectAttentionProject,
): string | null {
  const reasons = getArchitectProjectAttentionReasons(project);
  const priority: ArchitectProjectAttentionReason[] = [
    "stale_client_prices",
    "changes_requested",
    "commercial_dirty",
    "onboarding_rejected",
    "incomplete_client_pricing",
    "pending_onboarding",
    "submitted_review",
  ];

  for (const reason of priority) {
    if (reasons.includes(reason)) {
      return ARCHITECT_PROJECT_ATTENTION_LABELS[reason];
    }
  }

  return null;
}

export function projectRequiresArchitectAttention(
  project: ArchitectAttentionProject,
): boolean {
  return getArchitectProjectAttentionReasons(project).length > 0;
}
