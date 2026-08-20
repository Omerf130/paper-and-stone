import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import ProjectMessage from "@/models/ProjectMessage";
import { ADMIN_ARCHITECT_CONVERSATION_FILTER } from "@/lib/project-messages/conversation-filters";
import type { ProjectMessageAudience } from "@/types/project-message";

export async function getUnreadMessageCountsForProjects(
  projectIds: string[],
  viewerUserId: string,
  audience: ProjectMessageAudience,
): Promise<Map<string, number>> {
  if (projectIds.length === 0) {
    return new Map();
  }

  await connectDB();

  const objectIds = projectIds
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));

  if (objectIds.length === 0) {
    return new Map();
  }

  const rows = await ProjectMessage.aggregate<{ _id: Types.ObjectId; count: number }>([
    {
      $match: {
        projectId: { $in: objectIds },
        ...ADMIN_ARCHITECT_CONVERSATION_FILTER,
        audience,
        readByUserIds: { $ne: new Types.ObjectId(viewerUserId) },
      },
    },
    {
      $group: {
        _id: "$projectId",
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(rows.map((row) => [row._id.toString(), row.count]));
}

export type ArchitectClientUnreadAssignment = {
  projectId: string;
  clientUserId: string;
};

export async function getUnreadArchitectClientMessageCountsForProjects(
  assignments: ArchitectClientUnreadAssignment[],
  architectUserId: string,
): Promise<Map<string, number>> {
  const validAssignments = assignments.filter(
    (assignment) =>
      Types.ObjectId.isValid(assignment.projectId) &&
      Types.ObjectId.isValid(assignment.clientUserId),
  );

  if (validAssignments.length === 0) {
    return new Map();
  }

  await connectDB();

  const rows = await ProjectMessage.aggregate<{ _id: Types.ObjectId; count: number }>([
    {
      $match: {
        conversationType: "architect_client",
        audience: "architect",
        readByUserIds: { $ne: new Types.ObjectId(architectUserId) },
        $or: validAssignments.map((assignment) => ({
          projectId: new Types.ObjectId(assignment.projectId),
          clientUserIdAtSend: new Types.ObjectId(assignment.clientUserId),
        })),
      },
    },
    {
      $group: {
        _id: "$projectId",
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(rows.map((row) => [row._id.toString(), row.count]));
}

export async function getUnreadClientArchitectMessageCountsForProjects(
  projectIds: string[],
  clientUserId: string,
): Promise<Map<string, number>> {
  if (
    projectIds.length === 0 ||
    !Types.ObjectId.isValid(clientUserId)
  ) {
    return new Map();
  }

  await connectDB();

  const objectIds = projectIds
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));

  if (objectIds.length === 0) {
    return new Map();
  }

  const rows = await ProjectMessage.aggregate<{ _id: Types.ObjectId; count: number }>([
    {
      $match: {
        projectId: { $in: objectIds },
        conversationType: "architect_client",
        audience: "client",
        clientUserIdAtSend: new Types.ObjectId(clientUserId),
        readByUserIds: { $ne: new Types.ObjectId(clientUserId) },
      },
    },
    {
      $group: {
        _id: "$projectId",
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(rows.map((row) => [row._id.toString(), row.count]));
}
