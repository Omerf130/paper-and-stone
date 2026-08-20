import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import ProjectMessage from "@/models/ProjectMessage";
import { parseProjectMessageBody } from "@/lib/project-messages/message-validation";
import {
  assertMessagingAvailable,
  type MessagingViewerRole,
  verifyProjectMessagingAccess,
} from "@/lib/project-messages/verifyProjectMessagingAccess";
import { createMessageNotification } from "@/lib/notifications/createMessageNotification";
import {
  ProjectMessageMutationError,
  MESSAGE_ERRORS,
} from "@/lib/project-messages/message-errors";

const MESSAGE_LIMIT = 50;

export type CreateProjectMessageResult = {
  messageId: string;
  projectId: string;
  ownerUserId: string;
  projectName: string;
};

export async function createProjectMessage(
  userId: string,
  role: MessagingViewerRole,
  projectId: string,
  body: string,
): Promise<CreateProjectMessageResult> {
  const parsed = parseProjectMessageBody(body);
  if (!parsed.success) {
    throw new ProjectMessageMutationError(
      MESSAGE_ERRORS.GENERIC,
      parsed.fieldErrors,
    );
  }

  const context = await verifyProjectMessagingAccess(projectId, role, userId);
  assertMessagingAvailable(context);

  await connectDB();

  const audience = role === "admin" ? "professional" : "admin";
  const senderRole = role;
  const senderObjectId = new Types.ObjectId(userId);

  const message = await ProjectMessage.create({
    projectId: new Types.ObjectId(context.projectId),
    senderUserId: senderObjectId,
    senderRole,
    audience,
    conversationType: "admin_architect",
    body: parsed.data,
    readByUserIds: [senderObjectId],
  });

  if (role === "admin") {
    await createMessageNotification({
      recipientUserId: context.ownerUserId,
      projectId: context.projectId,
      messageId: message._id.toString(),
      projectNameSnapshot: context.projectName,
      body: parsed.data,
    });
  }

  return {
    messageId: message._id.toString(),
    projectId: context.projectId,
    ownerUserId: context.ownerUserId,
    projectName: context.projectName,
  };
}

export { MESSAGE_LIMIT };
