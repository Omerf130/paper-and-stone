import { CLIENT_DASHBOARD_PROJECT_LIMIT } from "@/lib/client-projects/client-project-params";
import { getClientApprovedProjectSnapshotsByProjectIds } from "@/lib/client-snapshots/getClientApprovedProjectSnapshots";
import { getClientAssignedProjectsMetadata } from "@/lib/client-projects/getClientAssignedProjectsMetadata";
import { getClientWorkspaceContext } from "@/lib/client-projects/getClientWorkspaceContext";
import { mapClientProjectListItemView } from "@/lib/client-projects/mapClientProjectListItemView";
import { resolveArchitectFullNamesForClientProjects } from "@/lib/client-projects/resolveArchitectFullNamesForClientProjects";
import { getUnreadClientArchitectMessageCountsForProjects } from "@/lib/project-messages/getUnreadMessageCountsForProjects";
import type { ClientDashboardData } from "@/types/client-project";

export async function getClientDashboardData(
  clientUserId: string,
): Promise<ClientDashboardData> {
  const [workspace, assignedResult] = await Promise.all([
    getClientWorkspaceContext(clientUserId),
    getClientAssignedProjectsMetadata({ clientUserId }),
  ]);

  const { projects: allProjects, total } = assignedResult;
  const recentProjectsMetadata = allProjects.slice(
    0,
    CLIENT_DASHBOARD_PROJECT_LIMIT,
  );
  const projectIds = allProjects.map((project) => project.projectId);

  const snapshotsByProjectId =
    await getClientApprovedProjectSnapshotsByProjectIds(
      clientUserId,
      projectIds,
    );

  const ownerUserIds = recentProjectsMetadata.map(
    (project) => project.ownerUserId,
  );
  const architectNames =
    await resolveArchitectFullNamesForClientProjects(ownerUserIds);

  const recentProjectIds = recentProjectsMetadata.map(
    (project) => project.projectId,
  );
  const unreadCounts = await getUnreadClientArchitectMessageCountsForProjects(
    recentProjectIds,
    clientUserId,
  );

  const recentProjects = recentProjectsMetadata.map((project) => {
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
    });
  });

  return {
    displayName: workspace.displayName,
    recentProjects,
    totalProjectCount: total,
    approvedSnapshotCount: snapshotsByProjectId.size,
  };
}
