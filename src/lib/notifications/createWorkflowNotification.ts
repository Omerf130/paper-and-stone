import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Notification from "@/models/Notification";
import { buildWorkflowNotificationIdempotencyKey } from "@/lib/notifications/notification-idempotency";
import { buildBodyPreview } from "@/lib/notifications/notification-preview";
import type { NotificationType } from "@/types/notification";

export type CreateWorkflowNotificationInput = {
  recipientUserId: string;
  type: NotificationType;
  projectId: string;
  reviewHistoryId: string;
  projectNameSnapshot: string;
  message?: string;
};

export async function createWorkflowNotification(
  input: CreateWorkflowNotificationInput,
): Promise<void> {
  try {
    await connectDB();

    const idempotencyKey = buildWorkflowNotificationIdempotencyKey({
      projectId: input.projectId,
      reviewHistoryId: input.reviewHistoryId,
      recipientUserId: input.recipientUserId,
      type: input.type,
    });

    const bodyPreview = buildBodyPreview(input.message);

    await Notification.updateOne(
      { idempotencyKey },
      {
        $setOnInsert: {
          recipientUserId: new Types.ObjectId(input.recipientUserId),
          type: input.type,
          projectId: new Types.ObjectId(input.projectId),
          reviewHistoryId: new Types.ObjectId(input.reviewHistoryId),
          projectNameSnapshot: input.projectNameSnapshot,
          bodyPreview,
          idempotencyKey,
          isRead: false,
        },
      },
      { upsert: true },
    );
  } catch (error: unknown) {
    console.error("[notifications] Failed to create workflow notification", {
      projectId: input.projectId,
      reviewHistoryId: input.reviewHistoryId,
      recipientUserId: input.recipientUserId,
      type: input.type,
      error,
    });
  }
}
