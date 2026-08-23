import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import ClientApprovedProjectSnapshot from "@/models/ClientApprovedProjectSnapshot";
import Project from "@/models/Project";

export async function isProjectItemInClientApprovedSnapshot(
  clientUserId: string,
  projectId: string,
  projectItemId: string,
): Promise<boolean> {
  if (
    !Types.ObjectId.isValid(clientUserId) ||
    !Types.ObjectId.isValid(projectId) ||
    !Types.ObjectId.isValid(projectItemId)
  ) {
    return false;
  }

  await connectDB();

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    clientUserId: new Types.ObjectId(clientUserId),
  })
    .select("_id")
    .lean();

  if (!project) {
    return false;
  }

  const snapshot = await ClientApprovedProjectSnapshot.findOne({
    projectId: new Types.ObjectId(projectId),
    clientUserId: new Types.ObjectId(clientUserId),
    "rooms.items.projectItemId": new Types.ObjectId(projectItemId),
  })
    .select("_id")
    .lean();

  return snapshot != null;
}
