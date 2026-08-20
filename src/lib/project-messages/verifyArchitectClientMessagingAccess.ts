import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import User from "@/models/User";
import { isClientRole } from "@/lib/auth/user-role";
import { MESSAGE_ERRORS } from "@/lib/project-messages/message-errors";
import { ProjectMessageMutationError } from "@/lib/project-messages/message-errors";

export type ArchitectClientMessagingContext = {
  projectId: string;
  ownerUserId: string;
  clientUserId: string;
  projectName: string;
  messagingAvailable: boolean;
  assignedClientActive: boolean;
};

export type ClientArchitectMessagingContext = {
  projectId: string;
  ownerUserId: string;
  clientUserId: string;
  projectName: string;
  messagingAvailable: boolean;
};

export function isArchitectClientMessagingAvailable(project: {
  clientUserId?: Types.ObjectId | string | null;
}): boolean {
  return project.clientUserId != null;
}

export async function verifyArchitectClientMessagingAccess(
  projectId: string,
  architectUserId: string,
): Promise<ArchitectClientMessagingContext> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new ProjectMessageMutationError(MESSAGE_ERRORS.NOT_FOUND);
  }

  const project = await Project.findById(projectId).select(
    "_id ownerUserId clientUserId name",
  );

  if (!project) {
    throw new ProjectMessageMutationError(MESSAGE_ERRORS.NOT_FOUND);
  }

  if (project.ownerUserId.toString() !== architectUserId) {
    throw new ProjectMessageMutationError(MESSAGE_ERRORS.FORBIDDEN);
  }

  const clientUserId = project.clientUserId?.toString() ?? null;
  const messagingAvailable = clientUserId != null;
  let assignedClientActive = false;

  if (clientUserId) {
    const client = await User.findById(clientUserId).select("isActive role");
    assignedClientActive =
      client != null && client.isActive && isClientRole(client.role);
  }

  return {
    projectId: project._id.toString(),
    ownerUserId: project.ownerUserId.toString(),
    clientUserId: clientUserId ?? "",
    projectName: project.name,
    messagingAvailable,
    assignedClientActive,
  };
}

export async function verifyClientArchitectMessagingAccess(
  projectId: string,
  clientUserId: string,
): Promise<ClientArchitectMessagingContext> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(clientUserId)) {
    throw new ProjectMessageMutationError(MESSAGE_ERRORS.NOT_FOUND);
  }

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    clientUserId: new Types.ObjectId(clientUserId),
  }).select("_id ownerUserId clientUserId name");

  if (!project?.clientUserId) {
    throw new ProjectMessageMutationError(MESSAGE_ERRORS.NOT_FOUND);
  }

  return {
    projectId: project._id.toString(),
    ownerUserId: project.ownerUserId.toString(),
    clientUserId: project.clientUserId.toString(),
    projectName: project.name,
    messagingAvailable: true,
  };
}

export function assertArchitectClientMessagingAvailable(
  context: ArchitectClientMessagingContext,
): void {
  if (!context.messagingAvailable || !context.clientUserId) {
    throw new ProjectMessageMutationError(MESSAGE_ERRORS.NOT_AVAILABLE);
  }
}

export function assertClientArchitectMessagingAvailable(
  context: ClientArchitectMessagingContext,
): void {
  if (!context.messagingAvailable) {
    throw new ProjectMessageMutationError(MESSAGE_ERRORS.NOT_AVAILABLE);
  }
}
