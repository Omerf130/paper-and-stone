import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import ProjectMessage, { type IProjectMessage } from "@/models/ProjectMessage";
import { ADMIN_ARCHITECT_CONVERSATION_FILTER } from "@/lib/project-messages/conversation-filters";
import {
  mapArchitectClientMessagesToViews,
  resolveClientContextNamesByUserId,
} from "@/lib/project-messages/mapArchitectClientMessageToView";
import {
  assertArchitectClientMessagingAvailable,
  verifyArchitectClientMessagingAccess,
} from "@/lib/project-messages/verifyArchitectClientMessagingAccess";
import {
  assertClientArchitectMessagingAvailable,
  verifyClientArchitectMessagingAccess,
} from "@/lib/project-messages/verifyArchitectClientMessagingAccess";
import { MESSAGE_LIMIT } from "@/lib/project-messages/createProjectMessage";
import type { ProjectConversationMessagesResult } from "@/types/project-message";

function buildArchitectClientFilter(
  projectId: string,
  clientUserIdAtSend: string,
): Record<string, unknown> {
  return {
    projectId: new Types.ObjectId(projectId),
    conversationType: "architect_client",
    clientUserIdAtSend: new Types.ObjectId(clientUserIdAtSend),
  };
}

async function fetchArchitectClientMessages(
  filter: Record<string, unknown>,
  viewerUserId: string,
  includeClientContext = false,
): Promise<ProjectConversationMessagesResult> {
  await connectDB();

  const totalCount = await ProjectMessage.countDocuments(filter);

  const messages = (await ProjectMessage.find(filter)
    .sort({ createdAt: -1 })
    .limit(MESSAGE_LIMIT)
    .lean()) as IProjectMessage[];

  const clientContextNamesByUserId = includeClientContext
    ? await resolveClientContextNamesByUserId(
        messages
          .map((message) => message.clientUserIdAtSend?.toString())
          .filter((value): value is string => Boolean(value)),
      )
    : undefined;

  const views = await mapArchitectClientMessagesToViews(
    messages.reverse(),
    viewerUserId,
    clientContextNamesByUserId,
  );

  return {
    messages: views,
    totalCount,
    truncated: totalCount > MESSAGE_LIMIT,
  };
}

export async function getArchitectClientProjectMessages(
  architectUserId: string,
  projectId: string,
): Promise<ProjectConversationMessagesResult> {
  const context = await verifyArchitectClientMessagingAccess(
    projectId,
    architectUserId,
  );

  if (!context.messagingAvailable) {
    return { messages: [], totalCount: 0, truncated: false };
  }

  return fetchArchitectClientMessages(
    buildArchitectClientFilter(context.projectId, context.clientUserId),
    architectUserId,
  );
}

export async function getClientArchitectProjectMessages(
  clientUserId: string,
  projectId: string,
): Promise<ProjectConversationMessagesResult> {
  const context = await verifyClientArchitectMessagingAccess(
    projectId,
    clientUserId,
  );

  if (!context.messagingAvailable) {
    return { messages: [], totalCount: 0, truncated: false };
  }

  return fetchArchitectClientMessages(
    buildArchitectClientFilter(context.projectId, context.clientUserId),
    clientUserId,
  );
}

export async function getAdminArchitectClientProjectMessages(
  projectId: string,
): Promise<ProjectConversationMessagesResult> {
  if (!Types.ObjectId.isValid(projectId)) {
    return { messages: [], totalCount: 0, truncated: false };
  }

  return fetchArchitectClientMessages(
    {
      projectId: new Types.ObjectId(projectId),
      conversationType: "architect_client",
    },
    "",
    true,
  );
}

export async function markArchitectClientMessagesRead(
  architectUserId: string,
  projectId: string,
): Promise<number> {
  const context = await verifyArchitectClientMessagingAccess(
    projectId,
    architectUserId,
  );
  assertArchitectClientMessagingAvailable(context);

  await connectDB();

  const result = await ProjectMessage.updateMany(
    {
      ...buildArchitectClientFilter(context.projectId, context.clientUserId),
      audience: "architect",
      readByUserIds: { $ne: new Types.ObjectId(architectUserId) },
    },
    {
      $addToSet: { readByUserIds: new Types.ObjectId(architectUserId) },
    },
  );

  return result.modifiedCount;
}

export async function markClientArchitectMessagesRead(
  clientUserId: string,
  projectId: string,
): Promise<number> {
  const context = await verifyClientArchitectMessagingAccess(
    projectId,
    clientUserId,
  );
  assertClientArchitectMessagingAvailable(context);

  await connectDB();

  const result = await ProjectMessage.updateMany(
    {
      ...buildArchitectClientFilter(context.projectId, context.clientUserId),
      audience: "client",
      readByUserIds: { $ne: new Types.ObjectId(clientUserId) },
    },
    {
      $addToSet: { readByUserIds: new Types.ObjectId(clientUserId) },
    },
  );

  return result.modifiedCount;
}

export { ADMIN_ARCHITECT_CONVERSATION_FILTER };
