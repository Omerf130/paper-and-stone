import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { getNormalizedProjectItemStatus } from "@/lib/project-items/project-item-status-normalize";
import { countClientReviewInWorkflowStatuses } from "@/lib/project-items/project-item-workflow-attention";
import { getClientProjectItemWorkflowStatuses } from "@/lib/client-projects/getClientProjectItemWorkflowStatuses";
import Project from "@/models/Project";
import type { ClientApprovedProjectView } from "@/types/client-approved-project";
import { collectSnapshotProjectItemIdsByProjectId } from "@/lib/client-projects/collectSnapshotProjectItemIds";

export async function getClientProjectWorkflowReviewCounts(
  clientUserId: string,
  snapshotsByProjectId: Map<string, ClientApprovedProjectView>,
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  if (
    !Types.ObjectId.isValid(clientUserId) ||
    snapshotsByProjectId.size === 0
  ) {
    return counts;
  }

  const snapshotItemIdsByProjectId =
    collectSnapshotProjectItemIdsByProjectId(snapshotsByProjectId);
  const projectIds = [...snapshotsByProjectId.keys()].filter((id) =>
    Types.ObjectId.isValid(id),
  );

  if (projectIds.length === 0) {
    return counts;
  }

  await connectDB();

  const projects = await Project.find({
    clientUserId: new Types.ObjectId(clientUserId),
    _id: { $in: projectIds.map((id) => new Types.ObjectId(id)) },
  })
    .select("_id items._id items.status")
    .lean();

  for (const project of projects) {
    const projectId = project._id.toString();
    const snapshotItemIds = snapshotItemIdsByProjectId.get(projectId);

    if (!snapshotItemIds || snapshotItemIds.length === 0) {
      counts.set(projectId, 0);
      continue;
    }

    const snapshotIdSet = new Set(snapshotItemIds);
    const workflowStatuses = (project.items ?? [])
      .filter((item) => snapshotIdSet.has(item._id.toString()))
      .map((item) => ({
        status: getNormalizedProjectItemStatus(item),
      }));

    counts.set(
      projectId,
      countClientReviewInWorkflowStatuses(workflowStatuses),
    );
  }

  for (const projectId of projectIds) {
    if (!counts.has(projectId)) {
      counts.set(projectId, 0);
    }
  }

  return counts;
}

export async function getClientProjectWorkflowReviewCountForProject(
  clientUserId: string,
  projectId: string,
  snapshotProjectItemIds: string[],
): Promise<number> {
  const workflowStatuses = await getClientProjectItemWorkflowStatuses(
    clientUserId,
    projectId,
    snapshotProjectItemIds,
  );

  return countClientReviewInWorkflowStatuses(workflowStatuses);
}
