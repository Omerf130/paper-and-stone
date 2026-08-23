import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import { buildProjectReturnHref } from "@/lib/catalog/catalog-params";
import { findProjectRoomForProject } from "@/lib/projects/project-room-queries";
import {
  isProjectItemEditable,
  isProjectOnboardingActive,
  usesRoomBasedWorkspace,
} from "@/lib/projects/project-workspace-gates";
import type { ArchitectCatalogProjectContextView } from "@/types/architect-catalog-context";

export async function getArchitectCatalogProjectContext(
  ownerUserId: string,
  input: { projectId: string | null; roomId: string | null },
): Promise<ArchitectCatalogProjectContextView | null> {
  const projectId = input.projectId?.trim() ?? "";
  const roomId = input.roomId?.trim() ?? "";

  if (
    !projectId ||
    !roomId ||
    !Types.ObjectId.isValid(projectId) ||
    !Types.ObjectId.isValid(roomId)
  ) {
    return null;
  }

  await connectDB();

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(ownerUserId),
  }).select("_id name status onboardingStatus");

  if (
    !project ||
    !usesRoomBasedWorkspace(project) ||
    !isProjectOnboardingActive(project) ||
    !isProjectItemEditable(project)
  ) {
    return null;
  }

  const room = await findProjectRoomForProject(projectId, roomId);

  if (!room) {
    return null;
  }

  return {
    projectId: project._id.toString(),
    projectName: project.name,
    roomId: room._id.toString(),
    roomName: room.name,
    returnHref: buildProjectReturnHref(projectId, roomId),
  };
}
