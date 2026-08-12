import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { calculatePagination } from "@/lib/catalog/catalog-pagination";
import Notification from "@/models/Notification";
import type { INotification } from "@/models/Notification";
import { mapNotificationToView } from "@/lib/notifications/mapNotificationToView";
import {
  NOTIFICATIONS_PAGE_SIZE,
  type NotificationsParams,
} from "@/lib/notifications/notification-params";
import type { NotificationsPageResult } from "@/types/notification";

export async function getUnreadNotificationCount(
  recipientUserId: string,
): Promise<number> {
  await connectDB();

  return Notification.countDocuments({
    recipientUserId: new Types.ObjectId(recipientUserId),
    isRead: false,
  });
}

export async function getProfessionalNotifications(
  recipientUserId: string,
  params: NotificationsParams,
): Promise<NotificationsPageResult> {
  await connectDB();

  const filter = {
    recipientUserId: new Types.ObjectId(recipientUserId),
  };

  const total = await Notification.countDocuments(filter);
  const pagination = calculatePagination({
    total,
    page: params.page,
    pageSize: NOTIFICATIONS_PAGE_SIZE,
  });

  const notifications = (await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(pagination.skip)
    .limit(pagination.pageSize)
    .lean()) as INotification[];

  return {
    notifications: notifications.map((notification) =>
      mapNotificationToView(notification),
    ),
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: pagination.totalPages,
  };
}

export async function markNotificationRead(
  recipientUserId: string,
  notificationId: string,
): Promise<boolean> {
  await connectDB();

  if (!Types.ObjectId.isValid(notificationId)) {
    return false;
  }

  const now = new Date();
  const result = await Notification.updateOne(
    {
      _id: new Types.ObjectId(notificationId),
      recipientUserId: new Types.ObjectId(recipientUserId),
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: now,
      },
    },
  );

  return result.modifiedCount > 0;
}

export async function markAllNotificationsRead(
  recipientUserId: string,
): Promise<number> {
  await connectDB();

  const now = new Date();
  const result = await Notification.updateMany(
    {
      recipientUserId: new Types.ObjectId(recipientUserId),
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: now,
      },
    },
  );

  return result.modifiedCount;
}
