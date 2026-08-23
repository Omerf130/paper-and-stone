import type { IProject, IProjectItem } from "@/models/Project";
import { PRICING_ERRORS } from "@/lib/pricing/pricing-validation";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import {
  hasPendingAdminPricingDelivery,
  isAdminLayerPricingIncomplete,
} from "@/lib/pricing/admin-pricing-round";
import {
  isArchitectWorkspaceEditable,
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

export function isArchitectProjectPricingEditable(
  project: ProjectPricingGateInput,
): boolean {
  return usesLayeredPricing(project) && isArchitectWorkspaceEditable(project);
}

/** @deprecated Use isAdminProjectPricingEditable or isArchitectProjectPricingEditable */
export function isProjectPricingEditable(
  project: ProjectPricingGateInput,
): boolean {
  return isArchitectProjectPricingEditable(project);
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

  if (role === "architect" && project.status === "submitted") {
    return "הפרויקט נשלח לבדיקה — לא ניתן לערוך עד לקבלת תשובה";
  }

  if (
    role === "admin"
      ? !isAdminProjectPricingEditable(project)
      : !isArchitectProjectPricingEditable(project)
  ) {
    return PRICING_ERRORS.NOT_EDITABLE;
  }

  return undefined;
}

export type LayeredPricingCompleteness = {
  isComplete: boolean;
  unpricedArchitectCount: number;
  unpricedClientCount: number;
  staleClientCount: number;
};

export function getLayeredPricingCompleteness(
  items: IProjectItem[],
): LayeredPricingCompleteness {
  let unpricedArchitectCount = 0;
  let unpricedClientCount = 0;
  let staleClientCount = 0;
  let unpricedAdminLayerCount = 0;

  for (const item of items) {
    const pricing = item.pricing;

    if (isAdminLayerPricingIncomplete(pricing)) {
      unpricedAdminLayerCount += 1;
    }

    if (pricing?.architectPriceAgorot == null) {
      unpricedArchitectCount += 1;
    }

    if (pricing?.clientPriceAgorot == null) {
      unpricedClientCount += 1;
    }

    if (pricing?.clientPriceStale) {
      staleClientCount += 1;
    }
  }

  return {
    isComplete:
      unpricedAdminLayerCount === 0 &&
      unpricedClientCount === 0 &&
      staleClientCount === 0,
    unpricedArchitectCount,
    unpricedClientCount,
    staleClientCount,
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

  if (
    completeness.unpricedArchitectCount > 0 ||
    completeness.unpricedClientCount > 0
  ) {
    throw new ProjectMutationError(PRICING_ERRORS.INCOMPLETE_PRICING);
  }

  if (completeness.staleClientCount > 0) {
    throw new ProjectMutationError(PRICING_ERRORS.STALE_PRICING_SUBMIT);
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

  if (
    completeness.unpricedArchitectCount > 0 ||
    completeness.unpricedClientCount > 0
  ) {
    return PRICING_ERRORS.INCOMPLETE_PRICING;
  }

  if (completeness.staleClientCount > 0) {
    return PRICING_ERRORS.STALE_PRICING_SUBMIT;
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

  if (
    completeness.unpricedArchitectCount > 0 ||
    completeness.unpricedClientCount > 0
  ) {
    return PRICING_ERRORS.INCOMPLETE_PRICING;
  }

  if (completeness.staleClientCount > 0) {
    return PRICING_ERRORS.STALE_PRICING_SUBMIT;
  }

  return null;
}
