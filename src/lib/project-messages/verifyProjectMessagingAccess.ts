import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import { isMessagingAvailable } from "@/lib/projects/project-workspace-gates";
import { MESSAGE_ERRORS } from "@/lib/project-messages/message-errors";
import { ProjectMessageMutationError } from "@/lib/project-messages/message-errors";
import type { ProjectMessageAudience } from "@/types/project-message";

export type MessagingViewerRole = "professional" | "admin";

export type ProjectMessagingContext = {
  projectId: string;
  ownerUserId: string;
  projectName: string;
  messagingAvailable: boolean;
  viewerAudience: ProjectMessageAudience;
};

export function getViewerAudience(
  role: MessagingViewerRole,
): ProjectMessageAudience {
  return role === "admin" ? "admin" : "professional";
}

export async function verifyProjectMessagingAccess(
  projectId: string,
  role: MessagingViewerRole,
  userId: string,
): Promise<ProjectMessagingContext> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new ProjectMessageMutationError(MESSAGE_ERRORS.NOT_FOUND);
  }

  const project = await Project.findById(projectId).select(
    "_id ownerUserId name reviewHistory onboardingStatus status",
  );

  if (!project) {
    throw new ProjectMessageMutationError(MESSAGE_ERRORS.NOT_FOUND);
  }

  if (role === "professional") {
    if (project.ownerUserId.toString() !== userId) {
      throw new ProjectMessageMutationError(MESSAGE_ERRORS.FORBIDDEN);
    }
  }

  const messagingAvailable = isMessagingAvailable(project);

  return {
    projectId: project._id.toString(),
    ownerUserId: project.ownerUserId.toString(),
    projectName: project.name,
    messagingAvailable,
    viewerAudience: getViewerAudience(role),
  };
}

export function assertMessagingAvailable(context: ProjectMessagingContext): void {
  if (!context.messagingAvailable) {
    throw new ProjectMessageMutationError(MESSAGE_ERRORS.NOT_AVAILABLE);
  }
}
