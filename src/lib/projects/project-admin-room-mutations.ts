import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import ProjectRoom from "@/models/ProjectRoom";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PROJECT_ERRORS } from "@/lib/projects/project-validation";
import { parseProjectRoomName } from "@/lib/projects/project-room-validation";
import {
  findProjectRoomForProject,
  getNextProjectRoomOrder,
  getProjectRoomsForProject,
} from "@/lib/projects/project-room-queries";
import {
  isAdminProjectRoomEditable,
  usesRoomBasedWorkspace,
} from "@/lib/projects/project-workspace-gates";
import { projectHasItemsInRoom } from "@/lib/projects/project-room-helpers";
import { PROJECT_ROOM_ERRORS } from "@/types/project-room";
import {
  markProjectCommercialDirtyIfNeeded,
  appendCommercialDirtyToSet,
} from "@/lib/projects/project-commercial-dirty";

async function getAdminEditableRoomProject(projectId: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    onboardingStatus: "active",
    status: { $nin: ["rejected"] },
  });

  if (!project) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  if (!usesRoomBasedWorkspace(project)) {
    throw new ProjectMutationError(PROJECT_ROOM_ERRORS.NOT_EDITABLE);
  }

  if (!isAdminProjectRoomEditable(project)) {
    throw new ProjectMutationError(PROJECT_ROOM_ERRORS.NOT_EDITABLE);
  }

  return project;
}

export async function createProjectRoomAsAdmin(
  adminUserId: string,
  projectId: string,
  name: string,
): Promise<string> {
  await getAdminEditableRoomProject(projectId);

  const parsed = parseProjectRoomName(name);
  if (!parsed.success) {
    throw new ProjectMutationError(parsed.error);
  }

  const order = await getNextProjectRoomOrder(projectId);

  const room = await ProjectRoom.create({
    projectId: new Types.ObjectId(projectId),
    name: parsed.data,
    order,
    createdByUserId: new Types.ObjectId(adminUserId),
  });

  await markProjectCommercialDirtyIfNeeded(projectId);

  return room._id.toString();
}

export async function renameProjectRoomAsAdmin(
  projectId: string,
  roomId: string,
  name: string,
): Promise<void> {
  await getAdminEditableRoomProject(projectId);

  const parsed = parseProjectRoomName(name);
  if (!parsed.success) {
    throw new ProjectMutationError(parsed.error);
  }

  const result = await ProjectRoom.updateOne(
    {
      _id: new Types.ObjectId(roomId),
      projectId: new Types.ObjectId(projectId),
    },
    { $set: { name: parsed.data } },
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(PROJECT_ROOM_ERRORS.NOT_FOUND);
  }

  await markProjectCommercialDirtyIfNeeded(projectId);
}

export async function deleteProjectRoomAsAdmin(
  projectId: string,
  roomId: string,
): Promise<void> {
  const project = await getAdminEditableRoomProject(projectId);

  if (projectHasItemsInRoom(project.items, roomId)) {
    throw new ProjectMutationError(PROJECT_ROOM_ERRORS.HAS_ITEMS);
  }

  const result = await ProjectRoom.deleteOne({
    _id: new Types.ObjectId(roomId),
    projectId: new Types.ObjectId(projectId),
  });

  if (result.deletedCount === 0) {
    throw new ProjectMutationError(PROJECT_ROOM_ERRORS.NOT_FOUND);
  }

  await markProjectCommercialDirtyIfNeeded(projectId);
}

export async function moveProjectItemToRoomAsAdmin(
  projectId: string,
  itemId: string,
  targetRoomId?: string | null,
): Promise<void> {
  const project = await getAdminEditableRoomProject(projectId);

  let roomObjectId: Types.ObjectId | null = null;

  if (targetRoomId?.trim()) {
    await findProjectRoomForProject(projectId, targetRoomId);
    roomObjectId = new Types.ObjectId(targetRoomId);
  }

  const $set: Record<string, unknown> = {
    "items.$.roomId": roomObjectId,
  };
  appendCommercialDirtyToSet(project, $set);

  const result = await Project.updateOne(
    {
      _id: new Types.ObjectId(projectId),
      "items._id": new Types.ObjectId(itemId),
    },
    { $set },
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }
}

export async function getProjectRoomsForAdminPicker(
  projectId: string,
): Promise<Array<{ id: string; name: string }>> {
  await getAdminEditableRoomProject(projectId);
  const rooms = await getProjectRoomsForProject(projectId);
  return rooms.map((room) => ({
    id: room._id.toString(),
    name: room.name,
  }));
}
