import { calculatePagination } from "@/lib/catalog/catalog-pagination";
import { getUnreadClientArchitectMessageCountsForProjects } from "@/lib/project-messages/getUnreadMessageCountsForProjects";
import { getClientApprovedProjectSnapshotsByProjectIds } from "@/lib/client-snapshots/getClientApprovedProjectSnapshots";
import { getClientProjectWorkflowReviewCounts } from "@/lib/client-projects/getClientProjectWorkflowReviewCounts";
import {
  CLIENT_PROJECTS_PAGE_SIZE,
  type ClientProjectsParams,
} from "@/lib/client-projects/client-project-params";
import { getClientAssignedProjectsMetadata } from "@/lib/client-projects/getClientAssignedProjectsMetadata";
import { mapClientProjectListItemView } from "@/lib/client-projects/mapClientProjectListItemView";
import { resolveArchitectFullNamesForClientProjects } from "@/lib/client-projects/resolveArchitectFullNamesForClientProjects";
import type { ClientProjectsPageResult } from "@/types/client-project";

export async function getClientProjectsPage(
  clientUserId: string,
  params: ClientProjectsParams,
): Promise<ClientProjectsPageResult> {
  const { total } = await getClientAssignedProjectsMetadata({
    clientUserId,
    search: params.query,
  });

  const pagination = calculatePagination({
    total,
    page: params.page,
    pageSize: CLIENT_PROJECTS_PAGE_SIZE,
  });

  const { projects } = await getClientAssignedProjectsMetadata({
    clientUserId,
    search: params.query,
    skip: pagination.skip,
    limit: pagination.pageSize,
  });

  const projectIds = projects.map((project) => project.projectId);
  const snapshotsByProjectId =
    await getClientApprovedProjectSnapshotsByProjectIds(
      clientUserId,
      projectIds,
    );

  const ownerUserIds = projects.map((project) => project.ownerUserId);
  const architectNames =
    await resolveArchitectFullNamesForClientProjects(ownerUserIds);

  const unreadCounts = await getUnreadClientArchitectMessageCountsForProjects(
    projectIds,
    clientUserId,
  );

  const reviewCounts = await getClientProjectWorkflowReviewCounts(
    clientUserId,
    snapshotsByProjectId,
  );

  const listItems = projects.map((project) => {
    const snapshot = snapshotsByProjectId.get(project.projectId) ?? null;
    const architectFullName =
      snapshot?.architect.fullName ??
      architectNames.get(project.ownerUserId) ??
      "אדריכל";

    return mapClientProjectListItemView({
      project,
      snapshot,
      architectFullName,
      unreadMessageCount: unreadCounts.get(project.projectId) ?? 0,
      pendingReviewCount: reviewCounts.get(project.projectId) ?? 0,
    });
  });

  return {
    projects: listItems,
    page: pagination.page,
    pageSize: pagination.pageSize,
    total,
    totalPages: pagination.totalPages,
  };
}
