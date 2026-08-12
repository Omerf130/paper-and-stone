export const WORKFLOW_NOTIFICATION_TYPES = [
  "PROJECT_APPROVED",
  "PROJECT_REJECTED",
  "PROJECT_CHANGES_REQUESTED",
] as const;

export const MESSAGE_NOTIFICATION_TYPES = ["PROJECT_MESSAGE"] as const;

export const NOTIFICATION_TYPES = [
  ...WORKFLOW_NOTIFICATION_TYPES,
  ...MESSAGE_NOTIFICATION_TYPES,
] as const;

export type WorkflowNotificationType =
  (typeof WORKFLOW_NOTIFICATION_TYPES)[number];

export type MessageNotificationType =
  (typeof MESSAGE_NOTIFICATION_TYPES)[number];

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationView = {
  id: string;
  type: NotificationType;
  title: string;
  bodyPreview?: string;
  projectId: string;
  href: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
};

export type NotificationsPageResult = {
  notifications: NotificationView[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type NotificationActionState = {
  error?: string;
  success?: boolean;
};
