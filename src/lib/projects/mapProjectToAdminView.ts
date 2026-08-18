import type { IProject } from "@/models/Project";
import {
  mapProjectItemToView,
  resolveActiveProductIds,
} from "@/lib/projects/mapProjectToView";
import { getProjectRoomViews } from "@/lib/projects/project-room-queries";
import { mapReviewHistoryEntryToView } from "@/lib/projects/project-review-history";
import { usesRoomBasedWorkspace } from "@/lib/projects/project-workspace-gates";
import { resolveAssignedClientFullName } from "@/lib/admin/clients/client-lookup-queries";
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
    professionalEmail,
    professionalName,
    submittedAt: project.submittedAt?.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
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
    items: project.items.map((item) =>
      mapProjectItemToView(item, activeProductIds),
    ),
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
  };
}
