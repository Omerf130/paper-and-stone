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
  usesRoomBasedWorkspace,
} from "@/lib/projects/project-workspace-gates";
import { getProjectRoomViews } from "@/lib/projects/project-room-queries";
import { resolveAssignedClientFullName } from "@/lib/admin/clients/client-lookup-queries";

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
    items: project.items.map((item) =>
      mapProjectItemToView(item, activeProductIds),
    ),
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
  };
}

export function mapProjectToOptionView(project: IProject): ProjectOptionView {
  return {
    id: project._id.toString(),
    name: project.name,
  };
}
