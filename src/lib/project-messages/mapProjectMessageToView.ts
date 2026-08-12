import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import ProfessionalProfile from "@/models/ProfessionalProfile";
import type { IProjectMessage } from "@/models/ProjectMessage";
import type { MessagingViewerRole } from "@/lib/project-messages/verifyProjectMessagingAccess";
import type { ProjectMessageView } from "@/types/project-message";
import { getDisplayName } from "@/lib/professionals/profile-completeness";

type SenderLabelContext = {
  professionalNamesByUserId: Map<string, string>;
  professionalEmailsByUserId: Map<string, string>;
};

async function resolveSenderLabels(
  messages: IProjectMessage[],
): Promise<SenderLabelContext> {
  const professionalSenderIds = [
    ...new Set(
      messages
        .filter((message) => message.senderRole === "professional")
        .map((message) => message.senderUserId.toString()),
    ),
  ];

  if (professionalSenderIds.length === 0) {
    return {
      professionalNamesByUserId: new Map(),
      professionalEmailsByUserId: new Map(),
    };
  }

  await connectDB();

  const [profiles, users] = await Promise.all([
    ProfessionalProfile.find({
      userId: { $in: professionalSenderIds },
    })
      .select("userId fullName")
      .lean(),
    User.find({ _id: { $in: professionalSenderIds } })
      .select("_id email")
      .lean(),
  ]);

  const professionalNamesByUserId = new Map(
    profiles
      .filter((profile) => profile.fullName?.trim())
      .map((profile) => [profile.userId.toString(), profile.fullName!.trim()]),
  );

  const professionalEmailsByUserId = new Map(
    users.map((user) => [user._id.toString(), user.email]),
  );

  return { professionalNamesByUserId, professionalEmailsByUserId };
}

function resolveSenderLabel(
  message: IProjectMessage,
  viewerRole: MessagingViewerRole,
  ownerUserId: string,
  labels: SenderLabelContext,
): string {
  if (message.senderRole === "admin") {
    return "אדמין";
  }

  const senderId = message.senderUserId.toString();
  const email = labels.professionalEmailsByUserId.get(senderId) ?? "";
  const fullName = labels.professionalNamesByUserId.get(senderId);

  if (viewerRole === "professional" && senderId === ownerUserId) {
    return getDisplayName({ fullName }, email);
  }

  if (viewerRole === "admin") {
    return getDisplayName({ fullName }, email);
  }

  return getDisplayName({ fullName }, email);
}

export async function mapProjectMessagesToViews(
  messages: IProjectMessage[],
  viewerUserId: string,
  viewerRole: MessagingViewerRole,
  ownerUserId: string,
): Promise<ProjectMessageView[]> {
  const labels = await resolveSenderLabels(messages);

  return messages.map((message) => {
    const senderId = message.senderUserId.toString();
    const isOwnMessage = senderId === viewerUserId;
    const isReadForCurrentUser = message.readByUserIds.some(
      (id) => id.toString() === viewerUserId,
    );

    return {
      id: message._id.toString(),
      senderLabel: resolveSenderLabel(
        message,
        viewerRole,
        ownerUserId,
        labels,
      ),
      senderRole: message.senderRole,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      isOwnMessage,
      isReadForCurrentUser,
    };
  });
}
