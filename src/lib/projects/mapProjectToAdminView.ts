import type { IProject } from "@/models/Project";
import { buildProjectItemStatusViewsForItems } from "@/lib/project-items/build-project-item-status-view";
import {
  mapProjectItemToView,
  resolveActiveProductIds,
} from "@/lib/projects/mapProjectToView";
import { getProjectRoomViews, getProjectRoomsForProject } from "@/lib/projects/project-room-queries";
import { mapReviewHistoryEntryToView } from "@/lib/projects/project-review-history";
import { usesLayeredPricing, usesRoomBasedWorkspace, isAdminProjectWorkspaceEditable } from "@/lib/projects/project-workspace-gates";
import { resolveAssignedClientFullName } from "@/lib/admin/clients/client-lookup-queries";
import {
  mapAdminPricingTotalsView,
  mapAdminProjectItemPricingView,
  mapProjectPricingSettingsView,
} from "@/lib/pricing/pricing-view-mappers";
import { getCommercialApprovalBlockedReason } from "@/lib/client-snapshots/client-snapshot-gates";
import {
  getAdminWorkflowAttentionSummary,
} from "@/lib/project-items/project-item-workflow-attention";
import {
  getAdminProjectAttentionLabels,
  getAdminPricingRoundPresentationForProject,
  getProjectPricingAttention,
} from "@/lib/projects/admin-project-attention";
import { loadProjectItemSuppliers } from "@/lib/projects/loadProjectItemSuppliers";
import { mapProjectItemLogisticsView } from "@/lib/projects/mapProjectItemLogisticsView";
import {
  countLogisticsInProgressItems,
  getProjectPaymentSummaryForAdminView,
  getProjectPaymentsForAdminView,
} from "@/lib/projects/project-payment-queries";
import { Types } from "mongoose";
import User from "@/models/User";
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
    location: project.location,
    clientName: project.clientName,
    assignedClientFullName,
    clientUserId: project.clientUserId?.toString() ?? null,
    onboardingStatus: project.onboardingStatus ?? null,
    status: project.status,
    commercialDirty: project.commercialDirty ?? false,
    commercialDirtyAt: project.commercialDirtyAt?.toISOString(),
    itemCount: project.items.length,
    roomCount: 0,
    professionalEmail,
    professionalName,
    ownerUserId: project.ownerUserId.toString(),
    submittedAt: project.submittedAt?.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    attentionReasons: getAdminProjectAttentionLabels(project),
    pricingAttention: getProjectPricingAttention(project.items),
    pricingStateLabel:
      getAdminPricingRoundPresentationForProject(project)?.listBadgeLabel ?? null,
    workflowAttentionSummary: getAdminWorkflowAttentionSummary(project.items),
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
  const projectRooms = roomBased
    ? await getProjectRoomsForProject(project._id.toString())
    : [];
  const rooms = roomBased
    ? await getProjectRoomViews(project._id.toString(), project.items)
    : [];
  const layeredPricing = usesLayeredPricing(project);
  const statusViews = await buildProjectItemStatusViewsForItems(
    project.items,
    "admin",
  );
  const [payments, paymentSummary, productSuppliersById] = await Promise.all([
    getProjectPaymentsForAdminView(project._id.toString()),
    getProjectPaymentSummaryForAdminView(project._id.toString(), project.items),
    loadProjectItemSuppliers(productIds),
  ]);

  const logisticsAdminUserIds = project.items
    .map((item) => item.logistics?.updatedByAdminUserId?.toString())
    .filter((id): id is string => Boolean(id));
  const logisticsAdminLabels = await resolveLogisticsAdminLabels(logisticsAdminUserIds);

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
    commercialDirty: project.commercialDirty ?? false,
    commercialDirtyAt: project.commercialDirtyAt?.toISOString(),
    items: project.items.map((item) => {
      const statusView = statusViews.get(item._id.toString());
      const supplierInfo = productSuppliersById[item.productId.toString()];

      return {
        ...mapProjectItemToView(item, activeProductIds),
        status: statusView?.status,
        statusPresentation: statusView?.presentation,
        allowedTargetStatuses: statusView?.allowedTargetStatuses,
        logistics: mapProjectItemLogisticsView(item, logisticsAdminLabels),
        supplierName: supplierInfo?.supplierName,
        ...(layeredPricing
          ? {
              adminPricing: mapAdminProjectItemPricingView(item, project),
            }
          : {}),
      };
    }),
    usesRoomBasedWorkspace: roomBased,
    isWorkspaceEditable: isAdminProjectWorkspaceEditable(project),
    rooms,
    reviewHistory: (project.reviewHistory ?? []).map(mapReviewHistoryEntryToView),
    submittedAt: project.submittedAt?.toISOString(),
    reviewedAt: project.reviewedAt?.toISOString(),
    reviewedByUserId: project.reviewedByUserId?.toString(),
    professionalEmail,
    professionalName,
    ownerUserId: project.ownerUserId.toString(),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    attentionReasons: getAdminProjectAttentionLabels(project),
    pricingAttention: getProjectPricingAttention(project.items),
    workflowAttentionSummary: getAdminWorkflowAttentionSummary(project.items),
    ...(layeredPricing
      ? {
          pricingSettings: mapProjectPricingSettingsView(project),
          pricingTotals: mapAdminPricingTotalsView(project.items),
          pricingApprovalBlockedReason: getCommercialApprovalBlockedReason(
            project,
            projectRooms,
          ),
          adminPricingRound: getAdminPricingRoundPresentationForProject(project),
        }
      : {}),
    payments,
    paymentSummary,
    paymentSummaryCompact: paymentSummary.paymentSummaryCompact,
    logisticsInProgressCount: countLogisticsInProgressItems(project.items),
  };
}

async function resolveLogisticsAdminLabels(
  userIds: string[],
): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const users = await User.find({
    _id: { $in: uniqueIds.map((id) => new Types.ObjectId(id)) },
  })
    .select("fullName email")
    .lean();

  return new Map(
    users.map((user) => [
      user._id.toString(),
      user.fullName?.trim() || user.email,
    ]),
  );
}
