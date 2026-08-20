import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import ProjectMessage from "@/models/ProjectMessage";
import { ADMIN_ARCHITECT_CONVERSATION_FILTER } from "@/lib/project-messages/conversation-filters";
import {
  assertMessagingAvailable,
  type MessagingViewerRole,
  verifyProjectMessagingAccess,
} from "@/lib/project-messages/verifyProjectMessagingAccess";

export async function markProjectMessagesRead(
  userId: string,
  role: MessagingViewerRole,
  projectId: string,
): Promise<number> {
  const context = await verifyProjectMessagingAccess(projectId, role, userId);
  assertMessagingAvailable(context);

  await connectDB();

  const result = await ProjectMessage.updateMany(
    {
      projectId: new Types.ObjectId(context.projectId),
      ...ADMIN_ARCHITECT_CONVERSATION_FILTER,
      audience: context.viewerAudience,
      readByUserIds: { $ne: new Types.ObjectId(userId) },
    },
    {
      $addToSet: { readByUserIds: new Types.ObjectId(userId) },
    },
  );

  return result.modifiedCount;
}
