import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Notification from "@/models/Notification";
import { buildMessageNotificationIdempotencyKey } from "@/lib/notifications/notification-idempotency";
import { buildBodyPreview } from "@/lib/notifications/notification-preview";

export type CreateMessageNotificationInput = {
  recipientUserId: string;
  projectId: string;
  messageId: string;
  projectNameSnapshot: string;
  body: string;
};

export async function createMessageNotification(
  input: CreateMessageNotificationInput,
): Promise<void> {
  try {
    await connectDB();

    const idempotencyKey = buildMessageNotificationIdempotencyKey({
      projectId: input.projectId,
      messageId: input.messageId,
      recipientUserId: input.recipientUserId,
    });

    const bodyPreview = buildBodyPreview(input.body);

    await Notification.updateOne(
      { idempotencyKey },
      {
        $setOnInsert: {
          recipientUserId: new Types.ObjectId(input.recipientUserId),
          type: "PROJECT_MESSAGE",
          projectId: new Types.ObjectId(input.projectId),
          messageId: new Types.ObjectId(input.messageId),
          projectNameSnapshot: input.projectNameSnapshot,
          bodyPreview,
          idempotencyKey,
          isRead: false,
        },
      },
      { upsert: true },
    );
  } catch (error: unknown) {
    console.error("[notifications] Failed to create message notification", {
      projectId: input.projectId,
      messageId: input.messageId,
      recipientUserId: input.recipientUserId,
      error,
    });
  }
}
