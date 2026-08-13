import Link from "next/link";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { formatDateTime } from "@/lib/ui/format-date-time";
import { mapProjectStatusToBadge } from "@/lib/ui/map-status-badge";
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
  const statusBadge = mapProjectStatusToBadge(project.status);
  const actionHint = getProjectRequiredActionHint(project.status);
  const unreadCount =
    "unreadMessageCount" in project ? (project.unreadMessageCount ?? 0) : 0;

  return (
    <article className={styles.row}>
      <div className={styles.main}>
        <Link
          href={`/professional/projects/${project.id}`}
          className={styles.titleLink}
        >
          {project.name}
        </Link>
        {project.clientName ? (
          <p className={styles.client}>{project.clientName}</p>
        ) : null}
        <div className={styles.meta}>
          <StatusBadge tone={statusBadge.tone}>{statusBadge.label}</StatusBadge>
          {actionHint ? (
            <p className={styles.actionHint}>{actionHint}</p>
          ) : null}
        </div>
        <p className={styles.details}>
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
          variant="ghost"
          size="sm"
        >
          פתיחה
        </Button>
      </div>
    </article>
  );
}
