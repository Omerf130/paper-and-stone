import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { getProjectItemWorkflowSettings } from "@/lib/project-items/get-project-item-workflow-settings";
import { getNormalizedProjectItemStatus } from "@/lib/project-items/project-item-status-normalize";
import { getProjectItemStatusPresentation } from "@/lib/project-items/project-item-status-presentation";
import { getAllowedTargetStatusesForRole } from "@/lib/project-items/project-item-status-transition";
import Project from "@/models/Project";
import type {
  ClientProjectItemWorkflowStatusView,
} from "@/types/client-project";

/**
 * Resolves live workflow status for snapshot items only.
 * Client commercial visibility is governed by ClientApprovedProjectSnapshot
 * membership — NOT by item status (including `hidden`).
 */
export async function getClientProjectItemWorkflowStatuses(
  clientUserId: string,
  projectId: string,
  snapshotProjectItemIds: string[],
): Promise<ClientProjectItemWorkflowStatusView[]> {
  if (
    !Types.ObjectId.isValid(projectId) ||
    !Types.ObjectId.isValid(clientUserId) ||
    snapshotProjectItemIds.length === 0
  ) {
    return [];
  }

  await connectDB();

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    clientUserId: new Types.ObjectId(clientUserId),
  }).select("items._id items.status");

  if (!project) {
    return [];
  }

  const settings = await getProjectItemWorkflowSettings();
  const snapshotIdSet = new Set(snapshotProjectItemIds);
  const results: ClientProjectItemWorkflowStatusView[] = [];

  for (const item of project.items) {
    const projectItemId = item._id.toString();

    if (!snapshotIdSet.has(projectItemId)) {
      continue;
    }

    const status = getNormalizedProjectItemStatus(item);
    const allowedTargetStatuses = getAllowedTargetStatusesForRole(
      "client",
      status,
      settings,
    );

    results.push({
      projectItemId,
      status,
      allowedTargetStatuses,
      presentation: getProjectItemStatusPresentation(status, "client"),
    });
  }

  return results;
}
