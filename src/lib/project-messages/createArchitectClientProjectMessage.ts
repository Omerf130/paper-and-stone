import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import ProjectMessage from "@/models/ProjectMessage";
import { parseProjectMessageBody } from "@/lib/project-messages/message-validation";
import {
  assertArchitectClientMessagingAvailable,
  verifyArchitectClientMessagingAccess,
} from "@/lib/project-messages/verifyArchitectClientMessagingAccess";
import {
  assertClientArchitectMessagingAvailable,
  verifyClientArchitectMessagingAccess,
} from "@/lib/project-messages/verifyArchitectClientMessagingAccess";
import {
  ProjectMessageMutationError,
  MESSAGE_ERRORS,
} from "@/lib/project-messages/message-errors";

export type CreateArchitectClientMessageResult = {
  messageId: string;
  projectId: string;
};

export async function createArchitectClientProjectMessage(
  architectUserId: string,
  projectId: string,
  body: string,
): Promise<CreateArchitectClientMessageResult> {
  const parsed = parseProjectMessageBody(body);
  if (!parsed.success) {
    throw new ProjectMessageMutationError(
      MESSAGE_ERRORS.GENERIC,
      parsed.fieldErrors,
    );
  }

  const context = await verifyArchitectClientMessagingAccess(
    projectId,
    architectUserId,
  );
  assertArchitectClientMessagingAvailable(context);

  if (!context.assignedClientActive) {
    throw new ProjectMessageMutationError(MESSAGE_ERRORS.NOT_AVAILABLE);
  }

  await connectDB();

  const senderObjectId = new Types.ObjectId(architectUserId);

  const message = await ProjectMessage.create({
    projectId: new Types.ObjectId(context.projectId),
    senderUserId: senderObjectId,
    senderRole: "architect",
    audience: "client",
    conversationType: "architect_client",
    clientUserIdAtSend: new Types.ObjectId(context.clientUserId),
    body: parsed.data,
    readByUserIds: [senderObjectId],
  });

  return {
    messageId: message._id.toString(),
    projectId: context.projectId,
  };
}

export async function createClientArchitectProjectMessage(
  clientUserId: string,
  projectId: string,
  body: string,
): Promise<CreateArchitectClientMessageResult> {
  const parsed = parseProjectMessageBody(body);
  if (!parsed.success) {
    throw new ProjectMessageMutationError(
      MESSAGE_ERRORS.GENERIC,
      parsed.fieldErrors,
    );
  }

  const context = await verifyClientArchitectMessagingAccess(
    projectId,
    clientUserId,
  );
  assertClientArchitectMessagingAvailable(context);

  await connectDB();

  const senderObjectId = new Types.ObjectId(clientUserId);

  const message = await ProjectMessage.create({
    projectId: new Types.ObjectId(context.projectId),
    senderUserId: senderObjectId,
    senderRole: "client",
    audience: "architect",
    conversationType: "architect_client",
    clientUserIdAtSend: new Types.ObjectId(context.clientUserId),
    body: parsed.data,
    readByUserIds: [senderObjectId],
  });

  return {
    messageId: message._id.toString(),
    projectId: context.projectId,
  };
}
