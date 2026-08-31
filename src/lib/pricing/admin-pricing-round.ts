import type { IProject, IProjectItem } from "@/models/Project";
import { getItemPricingStatus } from "@/lib/pricing/pricing-commercial-model";
import { usesLayeredPricing } from "@/lib/projects/project-workspace-gates";

export type AdminPricingRoundFields = Pick<
  IProject,
  "onboardingStatus" | "adminPricingRevision" | "adminPricingDeliveredRevision"
>;

export function getAdminPricingRevision(project: AdminPricingRoundFields): number {
  return project.adminPricingRevision ?? 0;
}

export function getAdminPricingDeliveredRevision(
  project: AdminPricingRoundFields,
): number {
  return project.adminPricingDeliveredRevision ?? 0;
}

export function hasPendingAdminPricingDelivery(
  project: AdminPricingRoundFields,
): boolean {
  if (!usesLayeredPricing(project)) {
    return false;
  }

  return (
    getAdminPricingRevision(project) > getAdminPricingDeliveredRevision(project)
  );
}

export function isAdminLayerPricingIncomplete(
  pricing?: IProjectItem["pricing"] | null,
): boolean {
  return getItemPricingStatus(pricing) !== "priced";
}

export function isAdminPricingRoundComplete(items: IProjectItem[]): boolean {
  if (items.length === 0) {
    return false;
  }

  return items.every((item) => !isAdminLayerPricingIncomplete(item.pricing));
}

export function isAdminPricingReadyToDeliver(
  project: AdminPricingRoundFields & Pick<IProject, "items">,
): boolean {
  return (
    hasPendingAdminPricingDelivery(project) &&
    isAdminPricingRoundComplete(project.items)
  );
}

export function shouldOpenAdminPricingRound(
  project: AdminPricingRoundFields,
): boolean {
  if (!usesLayeredPricing(project)) {
    return false;
  }

  return (
    getAdminPricingRevision(project) === getAdminPricingDeliveredRevision(project)
  );
}

export function appendOpenAdminPricingRoundToUpdate(
  project: AdminPricingRoundFields,
  update: Record<string, unknown>,
): void {
  if (!shouldOpenAdminPricingRound(project)) {
    return;
  }

  const $inc = {
    ...((update.$inc as Record<string, number> | undefined) ?? {}),
    adminPricingRevision: 1,
  };
  update.$inc = $inc;
}

export function hasUnseenAdminPricingDelivery(
  project: AdminPricingRoundFields &
    Pick<IProject, "architectAdminPricingSeenRevision">,
): boolean {
  if (!usesLayeredPricing(project)) {
    return false;
  }

  const delivered = getAdminPricingDeliveredRevision(project);
  if (delivered === 0) {
    return false;
  }

  return delivered > (project.architectAdminPricingSeenRevision ?? 0);
}
