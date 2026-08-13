import type { ProjectStatus } from "@/types/project";

export function getProjectRequiredActionHint(status: ProjectStatus): string | null {
  switch (status) {
    case "changes_requested":
      return "נדרשת פעולה ממך";
    case "draft":
      return "ניתן להמשיך לערוך";
    case "submitted":
      return "ממתין לבדיקה";
    case "approved":
      return "אושר";
    case "rejected":
      return "נדחה";
    default:
      return null;
  }
}
