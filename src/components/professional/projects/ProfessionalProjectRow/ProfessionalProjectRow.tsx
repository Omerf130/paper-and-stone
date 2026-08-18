import Link from "next/link";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { formatDateTime } from "@/lib/ui/format-date-time";
import {
  mapOnboardingStatusToBadge,
  mapProjectStatusToBadge,
} from "@/lib/ui/map-status-badge";
import { getArchitectProjectActionHint } from "@/lib/projects/architect-project-attention";
import { getProjectRequiredActionHint } from "@/lib/projects/get-project-required-action-hint";
import type { ProfessionalDashboardProject } from "@/types/professional-dashboard";
import type { ProjectListItemView } from "@/types/project";
import styles from "./ProfessionalProjectRow.module.scss";

type ProfessionalProjectRowProps = {
  project: ProfessionalDashboardProject | ProjectListItemView;
};

export default function ProfessionalProjectRow({
  project,
}: ProfessionalProjectRowProps) {
  const hasOnboarding = project.onboardingStatus != null;
  const statusBadge = hasOnboarding && project.onboardingStatus
    ? mapOnboardingStatusToBadge(project.onboardingStatus)
    : mapProjectStatusToBadge(project.status);
  const actionHint =
    "actionHint" in project && project.actionHint
      ? project.actionHint
      : hasOnboarding
        ? project.onboardingStatus === "rejected"
          ? "יש לערוך ולשלוח מחדש לאישור"
          : project.onboardingStatus === "pending_approval"
            ? "ממתין לאישור מנהל המערכת"
            : getArchitectProjectActionHint({
                onboardingStatus: project.onboardingStatus ?? null,
                status: project.status,
                items: [],
              })
        : getProjectRequiredActionHint(project.status);
  const roomCount = "roomCount" in project ? project.roomCount : undefined;
  const unreadCount =
    "unreadMessageCount" in project ? (project.unreadMessageCount ?? 0) : 0;
  const clientLabel = hasOnboarding
    ? project.assignedClientFullName
    : project.clientName;

  return (
    <article className={styles.row}>
      <div className={styles.main}>
        <Link
          href={`/professional/projects/${project.id}`}
          className={styles.titleLink}
        >
          {project.name}
        </Link>
        {clientLabel ? (
          <p className={styles.client}>{clientLabel}</p>
        ) : null}
        <div className={styles.meta}>
          <StatusBadge tone={statusBadge.tone}>{statusBadge.label}</StatusBadge>
          {actionHint ? (
            <p className={styles.actionHint}>{actionHint}</p>
          ) : null}
        </div>
        <p className={styles.details}>
          {roomCount != null ? `${roomCount} חדרים · ` : ""}
          {project.itemCount} מוצרים · עודכן {formatDateTime(project.updatedAt)}
        </p>
        {unreadCount > 0 ? (
          <p className={styles.unread} role="status">
            הודעות חדשות: {unreadCount}
          </p>
        ) : null}
      </div>

      <div className={styles.side}>
        <Button
          href={`/professional/projects/${project.id}`}
          variant="secondary"
          size="sm"
        >
          פתיחת פרויקט
        </Button>
      </div>
    </article>
  );
}
