import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { formatDateTime } from "@/lib/ui/format-date-time";
import {
  mapOnboardingStatusToBadge,
  mapProjectStatusToBadge,
} from "@/lib/ui/map-status-badge";
import {
  ONBOARDING_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
  type AdminProjectListItemView,
} from "@/types/admin-project";
import cardStyles from "@/components/admin/list/admin-list-card.module.scss";
import tableStyles from "@/components/admin/list/admin-table.module.scss";
import styles from "./AdminProjectListItem.module.scss";

type AdminProjectListItemProps = {
  project: AdminProjectListItemView;
  variant: "table" | "card";
};

export default function AdminProjectListItem({
  project,
  variant,
}: AdminProjectListItemProps) {
  const clientLabel = project.assignedClientFullName ?? project.clientName;
  const workBadge = project.onboardingStatus
    ? mapOnboardingStatusToBadge(project.onboardingStatus)
    : null;
  const commercialBadge = mapProjectStatusToBadge(project.status);

  const attentionBadges =
    project.attentionReasons.length > 0 ? (
      <ul className={styles.attentionList}>
        {project.attentionReasons.map((reason) => (
          <li key={reason}>
            <StatusBadge tone="warning">{reason}</StatusBadge>
          </li>
        ))}
      </ul>
    ) : null;

  if (variant === "card") {
    return (
      <li className={cardStyles.card}>
        <div className={cardStyles.header}>
          <h2 className={cardStyles.title}>{project.name}</h2>
          {clientLabel ? (
            <p className={cardStyles.subtitle}>לקוח: {clientLabel}</p>
          ) : null}
        </div>

        <div className={cardStyles.badges}>
          {workBadge ? (
            <StatusBadge tone={workBadge.tone}>
              {ONBOARDING_STATUS_LABELS[project.onboardingStatus!]}: {workBadge.label}
            </StatusBadge>
          ) : null}
          <StatusBadge tone={commercialBadge.tone}>
            {PROJECT_STATUS_LABELS[project.status]}: {commercialBadge.label}
          </StatusBadge>
        </div>

        {attentionBadges}

        <div className={cardStyles.metaGrid}>
          <div className={cardStyles.metaRow}>
            <span className={cardStyles.metaLabel}>אדריכל</span>
            <span className={cardStyles.metaValue}>
              {project.professionalName ?? project.professionalEmail}
            </span>
          </div>
          <div className={cardStyles.metaRow}>
            <span className={cardStyles.metaLabel}>חדרים / מוצרים</span>
            <span className={cardStyles.metaValue}>
              {project.roomCount > 0
                ? `${project.roomCount} / ${project.itemCount}`
                : project.itemCount}
            </span>
          </div>
          <div className={cardStyles.metaRow}>
            <span className={cardStyles.metaLabel}>עודכן</span>
            <span className={cardStyles.metaValue}>
              <time dateTime={project.updatedAt}>
                {formatDateTime(project.updatedAt)}
              </time>
            </span>
          </div>
        </div>

        {(project.unreadMessageCount ?? 0) > 0 ? (
          <p className={cardStyles.unread} role="status">
            {project.unreadMessageCount} הודעות שלא נקראו
          </p>
        ) : null}

        <div className={cardStyles.actions}>
          <Button href={`/admin/projects/${project.id}`} variant="primary" size="sm">
            פתיחת פרויקט
          </Button>
        </div>
      </li>
    );
  }

  return (
    <tr>
      <td>
        <div className={tableStyles.primary}>{project.name}</div>
        {clientLabel ? <div className={tableStyles.subtle}>{clientLabel}</div> : null}
        {attentionBadges}
        {(project.unreadMessageCount ?? 0) > 0 ? (
          <div className={cardStyles.unread} role="status">
            {project.unreadMessageCount} הודעות שלא נקראו
          </div>
        ) : null}
      </td>
      <td>
        <div>{project.professionalName ?? project.professionalEmail}</div>
        <div className={tableStyles.subtle} dir="ltr">
          {project.professionalEmail}
        </div>
      </td>
      <td>
        <div className={styles.statusStack}>
          {workBadge ? (
            <StatusBadge tone={workBadge.tone}>
              {ONBOARDING_STATUS_LABELS[project.onboardingStatus!]}: {workBadge.label}
            </StatusBadge>
          ) : null}
          <StatusBadge tone={commercialBadge.tone}>
            {PROJECT_STATUS_LABELS[project.status]}: {commercialBadge.label}
          </StatusBadge>
        </div>
      </td>
      <td>
        {project.roomCount > 0
          ? `${project.roomCount} חדרים · ${project.itemCount} מוצרים`
          : project.itemCount}
      </td>
      <td>
        <time dateTime={project.updatedAt}>{formatDateTime(project.updatedAt)}</time>
      </td>
      <td>
        <Button href={`/admin/projects/${project.id}`} variant="secondary" size="sm">
          פתיחת פרויקט
        </Button>
      </td>
    </tr>
  );
}
