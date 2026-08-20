import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import ClientApprovedProjectSnapshot from "@/models/ClientApprovedProjectSnapshot";
import { mapClientApprovedProjectSnapshotToView } from "@/lib/client-snapshots/mapClientApprovedProjectSnapshotToView";
import type { ClientApprovedProjectView } from "@/types/client-approved-project";

async function assertSnapshotClientAssignment(
  projectId: string,
  clientUserId: string,
): Promise<boolean> {
  const project = await Project.findById(projectId).select("clientUserId").lean();

  if (!project?.clientUserId) {
    return false;
  }

  return project.clientUserId.toString() === clientUserId;
}

export async function getClientApprovedProjectSnapshots(
  clientUserId: string,
): Promise<ClientApprovedProjectView[]> {
  if (!Types.ObjectId.isValid(clientUserId)) {
    return [];
  }

  await connectDB();

  const snapshots = await ClientApprovedProjectSnapshot.find({
    clientUserId: new Types.ObjectId(clientUserId),
  })
    .sort({ approvedAt: -1 })
    .lean();

  const results: ClientApprovedProjectView[] = [];

  for (const snapshot of snapshots) {
    const stillAssigned = await assertSnapshotClientAssignment(
      snapshot.projectId.toString(),
      clientUserId,
    );

    if (!stillAssigned) {
      continue;
    }

    results.push(mapClientApprovedProjectSnapshotToView(snapshot));
  }

  return results;
}

export async function getClientApprovedProjectSnapshotByProjectId(
  clientUserId: string,
  projectId: string,
): Promise<ClientApprovedProjectView | null> {
  if (!Types.ObjectId.isValid(clientUserId) || !Types.ObjectId.isValid(projectId)) {
    return null;
  }

  await connectDB();

  const stillAssigned = await assertSnapshotClientAssignment(projectId, clientUserId);
  if (!stillAssigned) {
    return null;
  }

  const snapshot = await ClientApprovedProjectSnapshot.findOne({
    projectId: new Types.ObjectId(projectId),
    clientUserId: new Types.ObjectId(clientUserId),
  }).lean();

  if (!snapshot) {
    return null;
  }

  return mapClientApprovedProjectSnapshotToView(snapshot);
}

export async function getClientApprovedProjectSnapshotsByProjectIds(
  clientUserId: string,
  projectIds: string[],
): Promise<Map<string, ClientApprovedProjectView>> {
  const results = new Map<string, ClientApprovedProjectView>();

  if (
    !Types.ObjectId.isValid(clientUserId) ||
    projectIds.length === 0
  ) {
    return results;
  }

  const validProjectIds = projectIds.filter((id) => Types.ObjectId.isValid(id));

  if (validProjectIds.length === 0) {
    return results;
  }

  await connectDB();

  const snapshots = await ClientApprovedProjectSnapshot.find({
    clientUserId: new Types.ObjectId(clientUserId),
    projectId: {
      $in: validProjectIds.map((id) => new Types.ObjectId(id)),
    },
  }).lean();

  for (const snapshot of snapshots) {
    results.set(
      snapshot.projectId.toString(),
      mapClientApprovedProjectSnapshotToView(snapshot),
    );
  }

  return results;
}
