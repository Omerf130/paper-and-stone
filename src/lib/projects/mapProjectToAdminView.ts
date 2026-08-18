import type { IProject } from "@/models/Project";
import {
  mapProjectItemToView,
  resolveActiveProductIds,
} from "@/lib/projects/mapProjectToView";
import { getProjectRoomViews } from "@/lib/projects/project-room-queries";
import { mapReviewHistoryEntryToView } from "@/lib/projects/project-review-history";
import { usesLayeredPricing, usesRoomBasedWorkspace } from "@/lib/projects/project-workspace-gates";
import { resolveAssignedClientFullName } from "@/lib/admin/clients/client-lookup-queries";
import {
  mapAdminPricingTotalsView,
  mapAdminProjectItemPricingView,
  mapProjectPricingSettingsView,
} from "@/lib/pricing/pricing-view-mappers";
import { getLayeredPricingApprovalBlockedReason } from "@/lib/pricing/pricing-gates";
import {
  getAdminProjectAttentionLabels,
  getProjectPricingAttention,
} from "@/lib/projects/admin-project-attention";
import type {
  AdminProjectDetailView,
  AdminProjectListItemView,
} from "@/types/admin-project";

export async function mapLeanProjectToAdminListItem(
  project: IProject,
  professionalEmail: string,
  professionalName?: string,
): Promise<AdminProjectListItemView> {
  const assignedClientFullName = project.clientUserId
    ? await resolveAssignedClientFullName(project.clientUserId)
    : null;

  return {
    id: project._id.toString(),
    name: project.name,
    clientName: project.clientName,
    assignedClientFullName,
    clientUserId: project.clientUserId?.toString() ?? null,
    onboardingStatus: project.onboardingStatus ?? null,
    status: project.status,
    itemCount: project.items.length,
    roomCount: 0,
    professionalEmail,
    professionalName,
    submittedAt: project.submittedAt?.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    attentionReasons: getAdminProjectAttentionLabels(project),
    pricingAttention: getProjectPricingAttention(project.items),
  };
}

export async function mapLeanProjectToAdminDetailView(
  project: IProject,
  professionalEmail: string,
  professionalName?: string,
): Promise<AdminProjectDetailView> {
  const productIds = [
    ...new Set(project.items.map((item) => item.productId.toString())),
  ];
  const activeProductIds = await resolveActiveProductIds(productIds);
  const assignedClientFullName = project.clientUserId
    ? await resolveAssignedClientFullName(project.clientUserId)
    : null;
  const roomBased = usesRoomBasedWorkspace(project);
  const rooms = roomBased
    ? await getProjectRoomViews(project._id.toString(), project.items)
    : [];
  const layeredPricing = usesLayeredPricing(project);

  return {
    id: project._id.toString(),
    name: project.name,
    clientName: project.clientName,
    assignedClientFullName,
    clientUserId: project.clientUserId?.toString() ?? null,
    onboardingStatus: project.onboardingStatus ?? null,
    location: project.location,
    description: project.description,
    status: project.status,
    items: project.items.map((item) => ({
      ...mapProjectItemToView(item, activeProductIds),
      ...(layeredPricing
        ? {
            adminPricing: mapAdminProjectItemPricingView(item, project),
          }
        : {}),
    })),
    usesRoomBasedWorkspace: roomBased,
    rooms,
    reviewHistory: (project.reviewHistory ?? []).map(mapReviewHistoryEntryToView),
    submittedAt: project.submittedAt?.toISOString(),
    reviewedAt: project.reviewedAt?.toISOString(),
    reviewedByUserId: project.reviewedByUserId?.toString(),
    professionalEmail,
    professionalName,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    attentionReasons: getAdminProjectAttentionLabels(project),
    pricingAttention: getProjectPricingAttention(project.items),
    ...(layeredPricing
      ? {
          pricingSettings: mapProjectPricingSettingsView(project),
          pricingTotals: mapAdminPricingTotalsView(project.items),
          pricingApprovalBlockedReason: getLayeredPricingApprovalBlockedReason(
            project,
          ),
        }
      : {}),
  };
}
