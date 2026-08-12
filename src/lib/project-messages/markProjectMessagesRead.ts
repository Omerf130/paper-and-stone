import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import ProjectMessage from "@/models/ProjectMessage";
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
      audience: context.viewerAudience,
      readByUserIds: { $ne: new Types.ObjectId(userId) },
    },
    {
      $addToSet: { readByUserIds: new Types.ObjectId(userId) },
    },
  );

  return result.modifiedCount;
}
