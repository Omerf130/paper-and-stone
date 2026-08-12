import type { INotification } from "@/models/Notification";
import {
  buildNotificationHref,
  buildNotificationTitle,
} from "@/lib/notifications/notification-titles";
import type { NotificationView } from "@/types/notification";

export function mapNotificationToView(
  notification: INotification,
): NotificationView {
  return {
    id: notification._id.toString(),
    type: notification.type,
    title: buildNotificationTitle(
      notification.type,
      notification.projectNameSnapshot,
    ),
    bodyPreview: notification.bodyPreview,
    projectId: notification.projectId.toString(),
    href: buildNotificationHref(
      notification.type,
      notification.projectId.toString(),
    ),
    isRead: notification.isRead,
    readAt: notification.readAt?.toISOString(),
    createdAt: notification.createdAt.toISOString(),
  };
}
