import type { IProject } from "@/models/Project";
import {
  mapProjectItemToView,
  resolveActiveProductIds,
} from "@/lib/projects/mapProjectToView";
import { mapReviewHistoryEntryToView } from "@/lib/projects/project-review-history";
import type {
  AdminProjectDetailView,
  AdminProjectListItemView,
} from "@/types/admin-project";

export function mapLeanProjectToAdminListItem(
  project: IProject,
  professionalEmail: string,
  professionalName?: string,
): AdminProjectListItemView {
  return {
    id: project._id.toString(),
    name: project.name,
    clientName: project.clientName,
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

  return {
    id: project._id.toString(),
    name: project.name,
    clientName: project.clientName,
    location: project.location,
    description: project.description,
    status: project.status,
    items: project.items.map((item) =>
      mapProjectItemToView(item, activeProductIds),
    ),
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
