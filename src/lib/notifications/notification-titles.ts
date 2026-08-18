import type { NotificationType } from "@/types/notification";

export function buildNotificationTitle(
  type: NotificationType,
  projectNameSnapshot: string,
): string {
  switch (type) {
    case "PROJECT_APPROVED":
      return `הפרויקט ${projectNameSnapshot} אושר`;
    case "PROJECT_REJECTED":
      return `הפרויקט ${projectNameSnapshot} נדחה`;
    case "PROJECT_CHANGES_REQUESTED":
      return `נדרשים שינויים בפרויקט ${projectNameSnapshot}`;
    case "PROJECT_ONBOARDING_APPROVED":
      return `הפרויקט ${projectNameSnapshot} אושר לפתיחה`;
    case "PROJECT_ONBOARDING_REJECTED":
      return `בקשת פתיחת הפרויקט ${projectNameSnapshot} נדחתה`;
    case "PROJECT_MESSAGE":
      return `הודעה חדשה בפרויקט ${projectNameSnapshot}`;
    case "PROJECT_QUOTE_SENT":
      return `הצעת מחיר נשלחה לפרויקט ${projectNameSnapshot}`;
    default:
      return projectNameSnapshot;
  }
}

export function buildNotificationHref(
  type: NotificationType,
  projectId: string,
): string {
  const base = `/professional/projects/${projectId}`;
  if (type === "PROJECT_MESSAGE") {
    return `${base}#messages`;
  }

  if (type === "PROJECT_QUOTE_SENT") {
    return `${base}#project-quote`;
  }

  return base;
}
