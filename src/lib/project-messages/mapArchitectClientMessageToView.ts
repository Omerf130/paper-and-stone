import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import ProfessionalProfile from "@/models/ProfessionalProfile";
import type { IProjectMessage } from "@/models/ProjectMessage";
import type { ProjectConversationMessageView } from "@/types/project-message";

type ParticipantLabelContext = {
  namesByUserId: Map<string, string>;
};

async function resolveParticipantLabels(
  messages: IProjectMessage[],
): Promise<ParticipantLabelContext> {
  const userIds = [
    ...new Set(messages.map((message) => message.senderUserId.toString())),
  ];

  if (userIds.length === 0) {
    return { namesByUserId: new Map() };
  }

  await connectDB();

  const users = await User.find({ _id: { $in: userIds } })
    .select("_id fullName email")
    .lean();

  const namesByUserId = new Map<string, string>();

  for (const user of users) {
    if (user.fullName?.trim()) {
      namesByUserId.set(user._id.toString(), user.fullName.trim());
    }
  }

  const unresolvedIds = userIds.filter((id) => !namesByUserId.has(id));

  if (unresolvedIds.length > 0) {
    const profiles = await ProfessionalProfile.find({
      userId: { $in: unresolvedIds },
    })
      .select("userId fullName")
      .lean();

    for (const profile of profiles) {
      if (profile.fullName?.trim()) {
        namesByUserId.set(profile.userId.toString(), profile.fullName.trim());
      }
    }
  }

  for (const user of users) {
    const userId = user._id.toString();
    if (!namesByUserId.has(userId)) {
      namesByUserId.set(userId, user.email ?? "משתמש");
    }
  }

  return { namesByUserId };
}

function resolveSenderType(
  message: IProjectMessage,
): "architect" | "client" {
  if (message.senderRole === "client") {
    return "client";
  }

  return "architect";
}

export async function mapArchitectClientMessagesToViews(
  messages: IProjectMessage[],
  viewerUserId: string,
  clientContextNamesByUserId?: Map<string, string>,
): Promise<ProjectConversationMessageView[]> {
  const labels = await resolveParticipantLabels(messages);

  return messages.map((message) => {
    const senderId = message.senderUserId.toString();
    const senderType = resolveSenderType(message);
    const isOwnMessage = senderId === viewerUserId;
    const isReadForCurrentUser = message.readByUserIds.some(
      (id) => id.toString() === viewerUserId,
    );
    const clientContextId = message.clientUserIdAtSend?.toString();

    return {
      id: message._id.toString(),
      senderType,
      senderDisplayName: labels.namesByUserId.get(senderId) ?? "משתמש",
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      isOwnMessage,
      isReadForCurrentUser,
      clientContextName:
        clientContextId && clientContextNamesByUserId
          ? clientContextNamesByUserId.get(clientContextId)
          : undefined,
    };
  });
}

export async function resolveClientContextNamesByUserId(
  clientUserIds: string[],
): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(clientUserIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  await connectDB();

  const users = await User.find({ _id: { $in: uniqueIds } })
    .select("_id fullName email")
    .lean();

  return new Map(
    users.map((user) => [
      user._id.toString(),
      user.fullName?.trim() || user.email || "לקוח",
    ]),
  );
}
