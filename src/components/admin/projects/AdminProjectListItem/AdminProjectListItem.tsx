import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { formatUnreadMessageLabel } from "@/types/project-message";
import { formatDateTime } from "@/lib/ui/format-date-time";
import {
  mapOnboardingStatusToBadge,
  mapProjectStatusToBadge,
} from "@/lib/ui/map-status-badge";
import { getCommercialDirtyLabel } from "@/lib/projects/project-status-presentation";
import type { AdminProjectListItemView } from "@/types/admin-project";
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
  const dirtyBadge =
    project.status === "approved" && project.commercialDirty ? (
      <StatusBadge tone="warning">
        {getCommercialDirtyLabel("listBadge")}
      </StatusBadge>
    ) : null;
  const primaryAttention = project.attentionReasons[0];

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
            <StatusBadge tone={workBadge.tone}>{workBadge.label}</StatusBadge>
          ) : null}
          <StatusBadge tone={commercialBadge.tone}>{commercialBadge.label}</StatusBadge>
          {dirtyBadge}
        </div>

        {primaryAttention ? (
          <p className={styles.primaryAttention}>
            <StatusBadge tone="warning">{primaryAttention}</StatusBadge>
          </p>
        ) : null}

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

        {formatUnreadMessageLabel(project.unreadMessageCount ?? 0) ? (
          <p className={cardStyles.unread} role="status">
            {formatUnreadMessageLabel(project.unreadMessageCount ?? 0)}
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
        {primaryAttention ? (
          <div className={styles.primaryAttention}>
            <StatusBadge tone="warning">{primaryAttention}</StatusBadge>
          </div>
        ) : null}
        {formatUnreadMessageLabel(project.unreadMessageCount ?? 0) ? (
          <div className={cardStyles.unread} role="status">
            {formatUnreadMessageLabel(project.unreadMessageCount ?? 0)}
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
            <StatusBadge tone={workBadge.tone}>{workBadge.label}</StatusBadge>
          ) : null}
          <StatusBadge tone={commercialBadge.tone}>{commercialBadge.label}</StatusBadge>
          {dirtyBadge}
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
