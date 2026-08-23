import type { IProject, IProjectItem } from "@/models/Project";
import type {
  ProjectDetailView,
  ProjectItemView,
  ProjectListItemView,
  ProjectOptionView,
} from "@/types/project";
import Product from "@/models/Product";
import { connectDB } from "@/lib/db/mongoose";
import {
  getLatestOnboardingRejectionReason,
  mapReviewHistoryEntryToView,
} from "@/lib/projects/project-review-history";
import {
  canResubmitOnboarding,
  isProjectItemWorkspaceVisible,
  isProjectMetadataEditable,
  isProjectOnboardingDeletable,
  isProjectRoomEditable,
  usesLayeredPricing,
  usesRoomBasedWorkspace,
} from "@/lib/projects/project-workspace-gates";
import {
  getAdminPricingDeliveredRevision,
  hasUnseenAdminPricingDelivery,
} from "@/lib/pricing/admin-pricing-round";
import { getArchitectSubmitPricingBlockedReason } from "@/lib/pricing/pricing-gates";
import { getProjectRoomViews } from "@/lib/projects/project-room-queries";
import { resolveAssignedClientFullName } from "@/lib/admin/clients/client-lookup-queries";
import { buildProjectItemStatusViewsForItems } from "@/lib/project-items/build-project-item-status-view";
import { getNormalizedProjectItemStatus } from "@/lib/project-items/project-item-status-normalize";
import {
  mapArchitectPricingTotalsView,
  mapArchitectProjectItemPricingView,
  mapArchitectProjectPricingSettingsView,
} from "@/lib/pricing/pricing-view-mappers";

export function mapProjectItemToView(
  item: IProjectItem,
  activeProductIds: Set<string>,
): ProjectItemView {
  return {
    id: item._id.toString(),
    productId: item.productId.toString(),
    roomId: item.roomId?.toString() ?? null,
    selectedMaterialId: item.selectedMaterialId ?? null,
    selectedColorId: item.selectedColorId ?? null,
    selectedSizeKey: item.selectedSizeKey ?? null,
    quantity: item.quantity,
    snapshot: {
      productName: item.snapshot.productName,
      productSlug: item.snapshot.productSlug,
      sku: item.snapshot.sku,
      materialName: item.snapshot.materialName,
      colorName: item.snapshot.colorName,
      colorHex: item.snapshot.colorHex,
      sizeLabel: item.snapshot.sizeLabel,
    },
    isProductActive: activeProductIds.has(item.productId.toString()),
    status: getNormalizedProjectItemStatus(item),
  };
}

export async function resolveActiveProductIds(
  productIds: string[],
): Promise<Set<string>> {
  if (productIds.length === 0) {
    return new Set();
  }

  await connectDB();

  const activeProducts = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  })
    .select("_id")
    .lean();

  return new Set(activeProducts.map((product) => product._id.toString()));
}

export async function mapProjectToListItemView(
  project: IProject,
): Promise<ProjectListItemView> {
  const assignedClientFullName = project.clientUserId
    ? await resolveAssignedClientFullName(project.clientUserId)
    : null;

  return {
    id: project._id.toString(),
    name: project.name,
    clientName: project.clientName,
    assignedClientFullName,
    onboardingStatus: project.onboardingStatus ?? null,
    status: project.status,
    commercialDirty: project.commercialDirty ?? false,
    itemCount: project.items.length,
    submittedAt: project.submittedAt?.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export async function mapProjectToDetailView(
  project: IProject,
  selectedRoomId?: string | null,
): Promise<ProjectDetailView> {
  const productIds = [...new Set(project.items.map((item) => item.productId.toString()))];
  const activeProductIds = await resolveActiveProductIds(productIds);
  const reviewHistory = (project.reviewHistory ?? []).map(mapReviewHistoryEntryToView);
  const assignedClientFullName = project.clientUserId
    ? await resolveAssignedClientFullName(project.clientUserId)
    : null;
  const rooms = usesRoomBasedWorkspace(project)
    ? await getProjectRoomViews(project._id.toString(), project.items)
    : [];
  const layeredPricing = usesLayeredPricing(project);
  const statusViews = await buildProjectItemStatusViewsForItems(
    project.items,
    "architect",
  );

  return {
    id: project._id.toString(),
    name: project.name,
    clientName: project.clientName,
    assignedClientFullName,
    onboardingStatus: project.onboardingStatus ?? null,
    onboardingRejectionReason: getLatestOnboardingRejectionReason(reviewHistory),
    location: project.location,
    description: project.description,
    status: project.status,
    commercialDirty: project.commercialDirty ?? false,
    commercialDirtyAt: project.commercialDirtyAt?.toISOString(),
    items: project.items.map((item) => {
      const statusView = statusViews.get(item._id.toString());

      return {
        ...mapProjectItemToView(item, activeProductIds),
        status: statusView?.status,
        statusPresentation: statusView?.presentation,
        allowedTargetStatuses: statusView?.allowedTargetStatuses,
        ...(layeredPricing
          ? {
              architectPricing: mapArchitectProjectItemPricingView(item, project),
            }
          : {}),
      };
    }),
    reviewHistory,
    submittedAt: project.submittedAt?.toISOString(),
    reviewedAt: project.reviewedAt?.toISOString(),
    reviewedByUserId: project.reviewedByUserId?.toString(),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    isMetadataEditable: isProjectMetadataEditable(project),
    isItemWorkspaceVisible: isProjectItemWorkspaceVisible(project),
    isOnboardingDeletable: isProjectOnboardingDeletable(project),
    canResubmitOnboarding: canResubmitOnboarding(project),
    usesRoomBasedWorkspace: usesRoomBasedWorkspace(project),
    isRoomEditable: isProjectRoomEditable(project),
    rooms,
    selectedRoomId: selectedRoomId ?? null,
    ...(layeredPricing
      ? {
          pricingSettings: mapArchitectProjectPricingSettingsView(project),
          pricingTotals: mapArchitectPricingTotalsView(project.items),
          adminPricingDelivery: {
            hasUnseenDelivery: hasUnseenAdminPricingDelivery(project),
            deliveredRevision: getAdminPricingDeliveredRevision(project),
          },
          pricingSubmitBlockedReason: getArchitectSubmitPricingBlockedReason(project),
        }
      : {}),
  };
}

export function mapProjectToOptionView(project: IProject): ProjectOptionView {
  return {
    id: project._id.toString(),
    name: project.name,
  };
}
