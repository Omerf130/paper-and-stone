import type { NotificationType } from "@/types/notification";

export function buildWorkflowNotificationIdempotencyKey(input: {
  projectId: string;
  reviewHistoryId: string;
  recipientUserId: string;
  type: NotificationType;
}): string {
  return `project:${input.projectId}:review:${input.reviewHistoryId}:recipient:${input.recipientUserId}:type:${input.type}`;
}

export function buildMessageNotificationIdempotencyKey(input: {
  projectId: string;
  messageId: string;
  recipientUserId: string;
}): string {
  return `project:${input.projectId}:message:${input.messageId}:recipient:${input.recipientUserId}`;
}
