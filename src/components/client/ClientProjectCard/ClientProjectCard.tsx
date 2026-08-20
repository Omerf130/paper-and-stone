import Link from "next/link";
import { formatUnreadMessageLabel } from "@/types/project-message";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import Button from "@/components/ui/Button/Button";
import { formatIlsAgorot } from "@/lib/money/format-ils";
import type { ClientProjectListItemView } from "@/types/client-project";
import styles from "./ClientProjectCard.module.scss";

type ClientProjectCardProps = {
  project: ClientProjectListItemView;
};

function formatApprovedDate(isoDate: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

export default function ClientProjectCard({ project }: ClientProjectCardProps) {
  const detailHref = `/client/projects/${project.projectId}`;
  const messageHref = `${detailHref}#architect-messages`;
  const showApprovedTotals =
    project.hasApprovedSnapshot && !project.presentationState.isUpdating;
  const unreadLabel = formatUnreadMessageLabel(project.unreadMessageCount ?? 0);

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Link href={detailHref} className={styles.titleLink}>
            {project.projectName}
          </Link>
        </h3>
        <StatusBadge tone={project.presentationState.tone}>
          {project.presentationState.label}
        </StatusBadge>
      </div>

      <dl className={styles.meta}>
        <div className={styles.metaRow}>
          <dt>אדריכל</dt>
          <dd>{project.architectFullName}</dd>
        </div>

        {showApprovedTotals && project.approvedAt ? (
          <div className={styles.metaRow}>
            <dt>תאריך אישור</dt>
            <dd>{formatApprovedDate(project.approvedAt)}</dd>
          </div>
        ) : null}

        {showApprovedTotals && project.roomCount != null ? (
          <div className={styles.metaRow}>
            <dt>חדרים</dt>
            <dd>{project.roomCount}</dd>
          </div>
        ) : null}

        {showApprovedTotals && project.productCount != null ? (
          <div className={styles.metaRow}>
            <dt>מוצרים</dt>
            <dd>{project.productCount}</dd>
          </div>
        ) : null}

        {showApprovedTotals && project.clientProjectTotalAgorot != null ? (
          <div className={styles.metaRow}>
            <dt>סה״כ מאושר</dt>
            <dd className={styles.total}>
              {formatIlsAgorot(project.clientProjectTotalAgorot)}
            </dd>
          </div>
        ) : null}
      </dl>

      {project.presentationState.supportingText ? (
        <p className={styles.supportingText}>
          {project.presentationState.supportingText}
        </p>
      ) : null}

      {unreadLabel ? (
        <p className={styles.unread} role="status">
          <Link href={messageHref} className={styles.unreadLink}>
            {unreadLabel}
          </Link>
        </p>
      ) : null}

      <div className={styles.actions}>
        <Button href={detailHref} size="sm" variant="secondary">
          פתיחת הפרויקט
        </Button>
      </div>
    </article>
  );
}
