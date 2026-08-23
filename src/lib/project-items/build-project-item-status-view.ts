import { getProjectItemWorkflowSettings } from "@/lib/project-items/get-project-item-workflow-settings";
import { getNormalizedProjectItemStatus } from "@/lib/project-items/project-item-status-normalize";
import { getProjectItemStatusPresentation } from "@/lib/project-items/project-item-status-presentation";
import { getAllowedTargetStatusesForRole } from "@/lib/project-items/project-item-status-transition";
import type { IProjectItem } from "@/models/Project";
import type {
  ProjectItemStatus,
  ProjectItemStatusChangeRole,
  ProjectItemStatusPresentation,
} from "@/types/project-item-status";

export type ProjectItemStatusView = {
  status: ProjectItemStatus;
  presentation: ProjectItemStatusPresentation;
  allowedTargetStatuses: ProjectItemStatus[];
};

export async function buildProjectItemStatusView(
  item: Pick<IProjectItem, "status">,
  role: ProjectItemStatusChangeRole,
): Promise<ProjectItemStatusView> {
  const settings = await getProjectItemWorkflowSettings();
  const status = getNormalizedProjectItemStatus(item);
  const allowedTargetStatuses = getAllowedTargetStatusesForRole(
    role,
    status,
    settings,
  );

  return {
    status,
    presentation: getProjectItemStatusPresentation(
      status,
      role === "admin" ? "admin" : role === "architect" ? "architect" : "client",
    ),
    allowedTargetStatuses,
  };
}

export async function buildProjectItemStatusViewsForItems(
  items: Pick<IProjectItem, "_id" | "status">[],
  role: ProjectItemStatusChangeRole,
): Promise<Map<string, ProjectItemStatusView>> {
  const settings = await getProjectItemWorkflowSettings();
  const views = new Map<string, ProjectItemStatusView>();

  for (const item of items) {
    const status = getNormalizedProjectItemStatus(item);
    views.set(item._id.toString(), {
      status,
      presentation: getProjectItemStatusPresentation(
        status,
        role === "admin" ? "admin" : role === "architect" ? "architect" : "client",
      ),
      allowedTargetStatuses: getAllowedTargetStatusesForRole(
        role,
        status,
        settings,
      ),
    });
  }

  return views;
}
