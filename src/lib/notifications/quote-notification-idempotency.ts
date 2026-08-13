import type { QuoteNotificationType } from "@/types/notification";

export function buildQuoteNotificationIdempotencyKey(input: {
  projectId: string;
  quoteId: string;
  recipientUserId: string;
  type: QuoteNotificationType;
}): string {
  return `project:${input.projectId}:quote:${input.quoteId}:recipient:${input.recipientUserId}:type:${input.type}`;
}
