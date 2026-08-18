import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import ProjectRoom, { type IProjectRoom } from "@/models/ProjectRoom";
import Project, { type IProject } from "@/models/Project";
import {
  computeRoomItemCounts,
  mapProjectRoomToView,
} from "@/lib/projects/project-room-helpers";
import type { ProjectRoomView } from "@/types/project-room";

export async function getProjectRoomsForProject(
  projectId: string,
): Promise<IProjectRoom[]> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    return [];
  }

  return ProjectRoom.find({ projectId: new Types.ObjectId(projectId) })
    .sort({ order: 1, createdAt: 1 })
    .lean() as Promise<IProjectRoom[]>;
}

export async function getProjectRoomViews(
  projectId: string,
  items: IProject["items"] = [],
): Promise<ProjectRoomView[]> {
  const rooms = await getProjectRoomsForProject(projectId);
  const counts = computeRoomItemCounts(rooms, items);

  return rooms.map((room) =>
    mapProjectRoomToView(room, counts.get(room._id.toString()) ?? 0),
  );
}

export async function findProjectRoomForProject(
  projectId: string,
  roomId: string,
): Promise<IProjectRoom | null> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(roomId)) {
    return null;
  }

  return ProjectRoom.findOne({
    _id: new Types.ObjectId(roomId),
    projectId: new Types.ObjectId(projectId),
  }).lean() as Promise<IProjectRoom | null>;
}

export async function getNextProjectRoomOrder(projectId: string): Promise<number> {
  await connectDB();

  const latest = await ProjectRoom.findOne({
    projectId: new Types.ObjectId(projectId),
  })
    .sort({ order: -1 })
    .select("order")
    .lean();

  return latest ? latest.order + 1 : 0;
}

export async function loadProjectWithRooms(
  projectId: string,
  ownerUserId?: string,
): Promise<{ project: IProject | null; rooms: ProjectRoomView[] }> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    return { project: null, rooms: [] };
  }

  const filter: Record<string, unknown> = {
    _id: new Types.ObjectId(projectId),
  };

  if (ownerUserId) {
    filter.ownerUserId = new Types.ObjectId(ownerUserId);
  }

  const project = (await Project.findOne(filter).lean()) as IProject | null;

  if (!project) {
    return { project: null, rooms: [] };
  }

  const rooms = await getProjectRoomViews(projectId, project.items);

  return { project, rooms };
}
