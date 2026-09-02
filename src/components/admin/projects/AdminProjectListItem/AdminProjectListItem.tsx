import Link from "next/link";
import AdminProjectThumbnailPlaceholder from "@/components/admin/projects/AdminProjectThumbnailPlaceholder/AdminProjectThumbnailPlaceholder";
import AdminProjectRowActions from "@/components/admin/projects/AdminProjectRowActions/AdminProjectRowActions";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { formatUnreadMessageLabel } from "@/types/project-message";
import { formatDateTime } from "@/lib/ui/format-date-time";
import { formatRelativeTime } from "@/lib/ui/format-relative-time";
import { resolveProjectListStatusPresentation } from "@/lib/projects/project-status-presentation";
import type { AdminProjectListItemView } from "@/types/admin-project";
import cardStyles from "@/components/admin/list/admin-list-card.module.scss";
import tableStyles from "../admin-projects-table.module.scss";
import styles from "./AdminProjectListItem.module.scss";

type AdminProjectListItemProps = {
  project: AdminProjectListItemView;
  variant: "table" | "card";
};

function formatUpdatedLabel(updatedAt: string): string {
  const relative = formatRelativeTime(updatedAt, "");
  return relative || formatDateTime(updatedAt);
}

export default function AdminProjectListItem({
  project,
  variant,
}: AdminProjectListItemProps) {
  const clientLabel = project.assignedClientFullName ?? project.clientName ?? "—";
  const architectLabel = project.professionalName ?? project.professionalEmail ?? "—";
  const statusPresentation = resolveProjectListStatusPresentation({
    onboardingStatus: project.onboardingStatus,
    status: project.status,
    commercialDirty: project.commercialDirty,
    attentionReasons: project.attentionReasons,
  });

  if (variant === "card") {
    return (
      <li className={cardStyles.card}>
        <div className={cardStyles.header}>
          <div className={styles.cardTitleRow}>
            <AdminProjectThumbnailPlaceholder />
            <div>
              <h2 className={cardStyles.title}>{project.name}</h2>
              {project.location ? (
                <p className={cardStyles.subtitle}>{project.location}</p>
              ) : null}
            </div>
          </div>
          <p className={cardStyles.subtitle}>לקוח: {clientLabel}</p>
        </div>

        <div className={cardStyles.badges}>
          <StatusBadge tone={statusPresentation.primaryTone}>
            {statusPresentation.primaryLabel}
          </StatusBadge>
          {statusPresentation.secondaryLabel ? (
            <span className={styles.statusSecondary}>
              {statusPresentation.secondaryLabel}
            </span>
          ) : null}
        </div>

        <div className={cardStyles.metaGrid}>
          <div className={cardStyles.metaRow}>
            <span className={cardStyles.metaLabel}>אדריכל</span>
            <span className={cardStyles.metaValue}>{architectLabel}</span>
          </div>
          <div className={cardStyles.metaRow}>
            <span className={cardStyles.metaLabel}>פריטים</span>
            <span className={cardStyles.metaValue}>
              {project.itemCount}
              {project.roomCount > 0 ? ` · ${project.roomCount} חדרים` : ""}
            </span>
          </div>
          <div className={cardStyles.metaRow}>
            <span className={cardStyles.metaLabel}>עודכן</span>
            <span className={cardStyles.metaValue}>
              <time dateTime={project.updatedAt}>
                {formatUpdatedLabel(project.updatedAt)}
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
          <AdminProjectRowActions projectId={project.id} />
        </div>
      </li>
    );
  }

  return (
    <tr>
      <td>
        <div className={tableStyles.projectCell}>
          <AdminProjectThumbnailPlaceholder />
          <div className={tableStyles.projectMeta}>
            <Link href={`/admin/projects/${project.id}`} className={tableStyles.projectName}>
              {project.name}
            </Link>
            {project.location ? (
              <span className={tableStyles.projectSecondary}>{project.location}</span>
            ) : null}
          </div>
        </div>
      </td>
      <td className={tableStyles.clientCell}>{clientLabel}</td>
      <td className={tableStyles.architectCell}>{architectLabel}</td>
      <td className={tableStyles.statusCell}>
        <div className={tableStyles.statusPrimary}>
          <StatusBadge tone={statusPresentation.primaryTone}>
            {statusPresentation.primaryLabel}
          </StatusBadge>
          {statusPresentation.secondaryLabel ? (
            <span className={tableStyles.statusSecondary}>
              {statusPresentation.secondaryLabel}
            </span>
          ) : null}
        </div>
      </td>
      <td className={tableStyles.itemsCell}>
        {project.itemCount}
        {project.roomCount > 0 ? (
          <span className={tableStyles.itemsSecondary}>
            {project.roomCount} חדרים
          </span>
        ) : null}
      </td>
      <td className={tableStyles.updatedCell}>
        <time dateTime={project.updatedAt}>
          {formatUpdatedLabel(project.updatedAt)}
        </time>
      </td>
      <td className={tableStyles.actionsCell}>
        <AdminProjectRowActions projectId={project.id} />
      </td>
    </tr>
  );
}
