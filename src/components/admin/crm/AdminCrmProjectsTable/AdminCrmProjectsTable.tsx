import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { formatDateTime } from "@/lib/ui/format-date-time";
import { mapProjectStatusToBadge } from "@/lib/ui/map-status-badge";
import {
  ONBOARDING_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
} from "@/types/admin-project";
import type { AdminCrmProjectView } from "@/types/admin-crm";
import tableStyles from "@/components/admin/list/admin-table.module.scss";
import cardStyles from "@/components/admin/list/admin-list-card.module.scss";
import layoutStyles from "@/components/admin/list/admin-list-layout.module.scss";
import styles from "./AdminCrmProjectsTable.module.scss";

type AdminCrmProjectsTableProps = {
  projects: AdminCrmProjectView[];
  showArchitect?: boolean;
  showClient?: boolean;
  emptyMessage?: string;
};

export default function AdminCrmProjectsTable({
  projects,
  showArchitect = false,
  showClient = false,
  emptyMessage = "אין פרויקטים.",
}: AdminCrmProjectsTableProps) {
  if (projects.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <>
      <div className={layoutStyles.desktopOnlyDesktop}>
        <div className={tableStyles.wrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th scope="col">פרויקט</th>
                {showArchitect ? <th scope="col">אדריכל</th> : null}
                {showClient ? <th scope="col">לקוח</th> : null}
                <th scope="col">פתיחה</th>
                <th scope="col">מסחרי</th>
                <th scope="col">מוצרים</th>
                <th scope="col">עודכן</th>
                <th scope="col">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const commercialBadge = mapProjectStatusToBadge(project.status);
                return (
                  <tr key={project.id}>
                    <td className={tableStyles.primary}>{project.name}</td>
                    {showArchitect ? (
                      <td>{project.architectName ?? "—"}</td>
                    ) : null}
                    {showClient ? (
                      <td>{project.clientName ?? "—"}</td>
                    ) : null}
                    <td>
                      {project.onboardingStatus
                        ? ONBOARDING_STATUS_LABELS[project.onboardingStatus]
                        : "—"}
                    </td>
                    <td>
                      <StatusBadge tone={commercialBadge.tone}>
                        {PROJECT_STATUS_LABELS[project.status]}: {commercialBadge.label}
                      </StatusBadge>
                    </td>
                    <td>{project.itemCount}</td>
                    <td>{formatDateTime(project.updatedAt)}</td>
                    <td className={tableStyles.actions}>
                      <Link href={`/admin/projects/${project.id}`}>פתיחה</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ul className={`${layoutStyles.mobileOnlyDesktop} ${cardStyles.list}`}>
        {projects.map((project) => {
          const commercialBadge = mapProjectStatusToBadge(project.status);
          return (
            <li key={project.id} className={cardStyles.card}>
              <div className={cardStyles.header}>
                <p className={cardStyles.title}>{project.name}</p>
                <StatusBadge tone={commercialBadge.tone}>
                  {commercialBadge.label}
                </StatusBadge>
              </div>
              <div className={cardStyles.metaGrid}>
                {showArchitect ? (
                  <div className={cardStyles.metaRow}>
                    <span className={cardStyles.metaLabel}>אדריכל:</span>
                    <span className={cardStyles.metaValue}>
                      {project.architectName ?? "—"}
                    </span>
                  </div>
                ) : null}
                {showClient ? (
                  <div className={cardStyles.metaRow}>
                    <span className={cardStyles.metaLabel}>לקוח:</span>
                    <span className={cardStyles.metaValue}>
                      {project.clientName ?? "—"}
                    </span>
                  </div>
                ) : null}
                <div className={cardStyles.metaRow}>
                  <span className={cardStyles.metaLabel}>עודכן:</span>
                  <span className={cardStyles.metaValue}>
                    {formatDateTime(project.updatedAt)}
                  </span>
                </div>
              </div>
              <Link href={`/admin/projects/${project.id}`} className={styles.openLink}>
                פתיחת פרויקט
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
