import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Notification from "@/models/Notification";
import { buildQuoteNotificationIdempotencyKey } from "@/lib/notifications/quote-notification-idempotency";
import { formatIlsAgorot } from "@/lib/money/format-ils";
import type { QuoteNotificationType } from "@/types/notification";

export type CreateQuoteNotificationInput = {
  recipientUserId: string;
  type: QuoteNotificationType;
  projectId: string;
  quoteId: string;
  projectNameSnapshot: string;
  totalAgorot?: number;
};

export async function createQuoteNotification(
  input: CreateQuoteNotificationInput,
): Promise<void> {
  try {
    await connectDB();

    const idempotencyKey = buildQuoteNotificationIdempotencyKey({
      projectId: input.projectId,
      quoteId: input.quoteId,
      recipientUserId: input.recipientUserId,
      type: input.type,
    });

    const bodyPreview =
      input.totalAgorot !== undefined
        ? `סך הצעה: ${formatIlsAgorot(input.totalAgorot)}`
        : undefined;

    await Notification.updateOne(
      { idempotencyKey },
      {
        $setOnInsert: {
          recipientUserId: new Types.ObjectId(input.recipientUserId),
          type: input.type,
          projectId: new Types.ObjectId(input.projectId),
          quoteId: new Types.ObjectId(input.quoteId),
          projectNameSnapshot: input.projectNameSnapshot,
          bodyPreview,
          idempotencyKey,
          isRead: false,
        },
      },
      { upsert: true },
    );
  } catch (error: unknown) {
    console.error("[notifications] Failed to create quote notification", {
      projectId: input.projectId,
      quoteId: input.quoteId,
      recipientUserId: input.recipientUserId,
      type: input.type,
      error,
    });
  }
}
