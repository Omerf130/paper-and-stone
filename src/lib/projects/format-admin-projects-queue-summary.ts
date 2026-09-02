import type { AdminProjectsQueueSummary } from "@/lib/projects/getAdminProjects";

export function formatAdminProjectsQueueSummary(
  summary: AdminProjectsQueueSummary,
): string {
  return [
    `${summary.all} סה״כ`,
    `${summary.active} פעילים`,
    `${summary.attention} דורשים טיפול`,
    `${summary.commercial} ממתינים לבדיקה`,
    `${summary.onboarding} ממתינים לאישור`,
  ].join(" · ");
}
