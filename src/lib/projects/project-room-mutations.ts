import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import ProjectRoom from "@/models/ProjectRoom";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PROJECT_ERRORS } from "@/lib/projects/project-validation";
import {
  parseProjectRoomName,
  parseProjectRoomReorderIds,
} from "@/lib/projects/project-room-validation";
import {
  findProjectRoomForProject,
  getNextProjectRoomOrder,
  getProjectRoomsForProject,
} from "@/lib/projects/project-room-queries";
import {
  isProjectRoomEditable,
  usesRoomBasedWorkspace,
} from "@/lib/projects/project-workspace-gates";
import { projectHasItemsInRoom } from "@/lib/projects/project-room-helpers";
import { PROJECT_ROOM_ERRORS } from "@/types/project-room";
import { markProjectCommercialDirtyIfNeeded, appendCommercialDirtyToSet } from "@/lib/projects/project-commercial-dirty";

async function getOwnedEditableProject(
  ownerUserId: string,
  projectId: string,
) {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(ownerUserId),
  });

  if (!project) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  if (!usesRoomBasedWorkspace(project)) {
    throw new ProjectMutationError(PROJECT_ROOM_ERRORS.NOT_EDITABLE);
  }

  if (!isProjectRoomEditable(project)) {
    throw new ProjectMutationError(PROJECT_ROOM_ERRORS.NOT_EDITABLE);
  }

  return project;
}

export async function createProjectRoom(
  ownerUserId: string,
  projectId: string,
  name: string,
): Promise<string> {
  await getOwnedEditableProject(ownerUserId, projectId);

  const parsed = parseProjectRoomName(name);
  if (!parsed.success) {
    throw new ProjectMutationError(parsed.error);
  }

  const order = await getNextProjectRoomOrder(projectId);

  const room = await ProjectRoom.create({
    projectId: new Types.ObjectId(projectId),
    name: parsed.data,
    order,
    createdByUserId: new Types.ObjectId(ownerUserId),
  });

  await markProjectCommercialDirtyIfNeeded(projectId);

  return room._id.toString();
}

export async function renameProjectRoom(
  ownerUserId: string,
  projectId: string,
  roomId: string,
  name: string,
): Promise<void> {
  await getOwnedEditableProject(ownerUserId, projectId);

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

export async function reorderProjectRooms(
  ownerUserId: string,
  projectId: string,
  roomIds: string[],
): Promise<void> {
  await getOwnedEditableProject(ownerUserId, projectId);

  const parsed = parseProjectRoomReorderIds(roomIds);
  if (!parsed.success) {
    throw new ProjectMutationError(parsed.error);
  }

  const existingRooms = await getProjectRoomsForProject(projectId);
  const existingIds = existingRooms.map((room) => room._id.toString()).sort();
  const requestedIds = [...parsed.data].sort();

  if (
    existingIds.length !== requestedIds.length ||
    existingIds.some((id, index) => id !== requestedIds[index])
  ) {
    throw new ProjectMutationError(PROJECT_ROOM_ERRORS.INVALID_REORDER);
  }

  await Promise.all(
    parsed.data.map((roomId, order) =>
      ProjectRoom.updateOne(
        {
          _id: new Types.ObjectId(roomId),
          projectId: new Types.ObjectId(projectId),
        },
        { $set: { order } },
      ),
    ),
  );

  await markProjectCommercialDirtyIfNeeded(projectId);
}

export async function deleteProjectRoom(
  ownerUserId: string,
  projectId: string,
  roomId: string,
): Promise<void> {
  const project = await getOwnedEditableProject(ownerUserId, projectId);

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

export async function verifyRoomBelongsToProject(
  projectId: string,
  roomId: string,
): Promise<void> {
  const room = await findProjectRoomForProject(projectId, roomId);

  if (!room) {
    throw new ProjectMutationError(PROJECT_ROOM_ERRORS.INVALID_ROOM);
  }
}

export async function moveProjectItemToRoom(
  ownerUserId: string,
  projectId: string,
  itemId: string,
  targetRoomId: string,
): Promise<void> {
  const project = await getOwnedEditableProject(ownerUserId, projectId);
  await verifyRoomBelongsToProject(projectId, targetRoomId);

  const $set: Record<string, unknown> = {
    "items.$.roomId": new Types.ObjectId(targetRoomId),
  };
  appendCommercialDirtyToSet(project, $set);

  const result = await Project.updateOne(
    {
      _id: new Types.ObjectId(projectId),
      ownerUserId: new Types.ObjectId(ownerUserId),
      "items._id": new Types.ObjectId(itemId),
    },
    { $set },
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }
}
