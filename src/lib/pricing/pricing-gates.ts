import type { IProject, IProjectItem } from "@/models/Project";
import { PRICING_ERRORS } from "@/lib/pricing/pricing-validation";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import {
  hasPendingAdminPricingDelivery,
  isAdminLayerPricingIncomplete,
} from "@/lib/pricing/admin-pricing-round";
import { getItemPricingStatus } from "@/lib/pricing/pricing-commercial-model";
import {
  isOnboardingPending,
  usesLayeredPricing,
} from "@/lib/projects/project-workspace-gates";

export type PricingRole = "admin" | "architect";

export type ProjectPricingGateInput = Pick<
  IProject,
  "status" | "onboardingStatus"
>;

export function isAdminProjectPricingEditable(
  project: ProjectPricingGateInput,
): boolean {
  return (
    usesLayeredPricing(project) &&
    project.onboardingStatus === "active" &&
    project.status !== "rejected"
  );
}

/** Architect cannot edit commercial pricing in Pricing V2. */
export function isArchitectProjectPricingEditable(
  _project: ProjectPricingGateInput,
): boolean {
  return false;
}

export function getPricingUnavailableReason(
  project: ProjectPricingGateInput,
  role: PricingRole,
): string | undefined {
  if (!usesLayeredPricing(project)) {
    return undefined;
  }

  if (isOnboardingPending(project)) {
    return "הפרויקט עדיין ממתין לאישור פתיחה";
  }

  if (project.onboardingStatus !== "active") {
    return PRICING_ERRORS.NOT_EDITABLE;
  }

  if (project.status === "rejected") {
    return "לא ניתן לתמחר פרויקט במצב הנוכחי";
  }

  if (role === "admin" && !isAdminProjectPricingEditable(project)) {
    return PRICING_ERRORS.NOT_EDITABLE;
  }

  if (role === "architect") {
    return PRICING_ERRORS.ARCHITECT_PRICING_READONLY;
  }

  return undefined;
}

export type LayeredPricingCompleteness = {
  isComplete: boolean;
  unpricedItemCount: number;
  needsReviewItemCount: number;
};

export function getLayeredPricingCompleteness(
  items: IProjectItem[],
): LayeredPricingCompleteness {
  let unpricedItemCount = 0;
  let needsReviewItemCount = 0;

  for (const item of items) {
    const status = getItemPricingStatus(item.pricing);

    if (status === "unpriced") {
      unpricedItemCount += 1;
    } else if (status === "needs_review") {
      needsReviewItemCount += 1;
    }
  }

  return {
    isComplete: unpricedItemCount === 0 && needsReviewItemCount === 0,
    unpricedItemCount,
    needsReviewItemCount,
  };
}

export function assertAdminPricingDeliveredForSubmit(
  project: Pick<
    IProject,
    | "onboardingStatus"
    | "adminPricingRevision"
    | "adminPricingDeliveredRevision"
    | "items"
  >,
): void {
  if (!usesLayeredPricing(project)) {
    return;
  }

  if (hasPendingAdminPricingDelivery(project)) {
    const adminIncomplete = project.items.some((item) =>
      isAdminLayerPricingIncomplete(item.pricing),
    );

    throw new ProjectMutationError(
      adminIncomplete
        ? PRICING_ERRORS.ADMIN_PRICING_INCOMPLETE
        : PRICING_ERRORS.ADMIN_PRICING_NOT_DELIVERED,
    );
  }
}

export function assertLayeredPricingCompleteForSubmit(
  project: Pick<
    IProject,
    | "onboardingStatus"
    | "adminPricingRevision"
    | "adminPricingDeliveredRevision"
    | "items"
  >,
): void {
  if (!usesLayeredPricing(project)) {
    return;
  }

  assertAdminPricingDeliveredForSubmit(project);

  const completeness = getLayeredPricingCompleteness(project.items);

  if (completeness.unpricedItemCount > 0) {
    throw new ProjectMutationError(PRICING_ERRORS.INCOMPLETE_PRICING);
  }

  if (completeness.needsReviewItemCount > 0) {
    throw new ProjectMutationError(PRICING_ERRORS.PRICING_NEEDS_REVIEW);
  }
}

export function assertLayeredPricingApprovalGate(
  project: Pick<IProject, "onboardingStatus" | "items">,
): void {
  assertLayeredPricingCompleteForSubmit(project);
}

export function getLayeredPricingApprovalBlockedReason(
  project: Pick<
    IProject,
    | "onboardingStatus"
    | "adminPricingRevision"
    | "adminPricingDeliveredRevision"
    | "items"
    | "clientUserId"
  >,
): string | null {
  if (!usesLayeredPricing(project)) {
    return null;
  }

  if (hasPendingAdminPricingDelivery(project)) {
    const adminIncomplete = project.items.some((item) =>
      isAdminLayerPricingIncomplete(item.pricing),
    );

    return adminIncomplete
      ? PRICING_ERRORS.ADMIN_PRICING_INCOMPLETE
      : PRICING_ERRORS.ADMIN_PRICING_NOT_DELIVERED;
  }

  const completeness = getLayeredPricingCompleteness(project.items);

  if (completeness.unpricedItemCount > 0) {
    return PRICING_ERRORS.INCOMPLETE_PRICING;
  }

  if (completeness.needsReviewItemCount > 0) {
    return PRICING_ERRORS.PRICING_NEEDS_REVIEW;
  }

  return null;
}

export function getArchitectSubmitPricingBlockedReason(
  project: Pick<
    IProject,
    | "onboardingStatus"
    | "adminPricingRevision"
    | "adminPricingDeliveredRevision"
    | "items"
  >,
): string | null {
  return getLayeredPricingApprovalBlockedReason(project);
}
