import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import ProjectMessage, { type IProjectMessage } from "@/models/ProjectMessage";
import {
  type MessagingViewerRole,
  verifyProjectMessagingAccess,
} from "@/lib/project-messages/verifyProjectMessagingAccess";
import { mapProjectMessagesToViews } from "@/lib/project-messages/mapProjectMessageToView";
import type { ProjectMessagesResult } from "@/types/project-message";
import { MESSAGE_LIMIT } from "@/lib/project-messages/createProjectMessage";

export async function getProjectMessages(
  userId: string,
  role: MessagingViewerRole,
  projectId: string,
): Promise<ProjectMessagesResult> {
  const context = await verifyProjectMessagingAccess(projectId, role, userId);

  if (!context.messagingAvailable) {
    return { messages: [], totalCount: 0, truncated: false };
  }

  await connectDB();

  const filter = { projectId: new Types.ObjectId(context.projectId) };
  const totalCount = await ProjectMessage.countDocuments(filter);

  const messages = (await ProjectMessage.find(filter)
    .sort({ createdAt: -1 })
    .limit(MESSAGE_LIMIT)
    .lean()) as IProjectMessage[];

  const views = await mapProjectMessagesToViews(
    messages.reverse(),
    userId,
    role,
    context.ownerUserId,
  );

  return {
    messages: views,
    totalCount,
    truncated: totalCount > MESSAGE_LIMIT,
  };
}
