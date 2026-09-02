import Link from "next/link";
import AdminDashboardProjectThumbnail from "@/components/admin/dashboard/AdminDashboardProjectThumbnail";
import AdminProjectRowActions from "@/components/admin/projects/AdminProjectRowActions/AdminProjectRowActions";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import type { AdminDashboardRecentProject } from "@/types/admin-dashboard";
import { formatDateTime } from "@/lib/ui/format-date-time";
import { mapProjectStatusToBadge } from "@/lib/ui/map-status-badge";
import type { ProjectStatus } from "@/types/project";
import styles from "./AdminDashboardRecentProjects.module.scss";

type AdminDashboardRecentProjectsProps = {
  projects: AdminDashboardRecentProject[];
  totalProjects: number;
};

export default function AdminDashboardRecentProjects({
  projects,
  totalProjects,
}: AdminDashboardRecentProjectsProps) {
  return (
    <section className={styles.section} aria-labelledby="dashboard-recent-title">
      <div className={styles.header}>
        <h2 id="dashboard-recent-title" className={styles.title}>
          פרויקטים אחרונים
        </h2>
        <Link href="/admin/projects?queue=all" className={styles.viewAll}>
          צפייה בכל הפרויקטים →
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className={styles.empty}>אין פרויקטים להצגה</p>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">פרויקט</th>
                  <th scope="col">סטטוס</th>
                  <th scope="col">עודכן</th>
                  <th scope="col">פריטים</th>
                  <th scope="col">
                    <span className={styles.srOnly}>פעולות</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const badge = mapProjectStatusToBadge(
                    project.status as ProjectStatus,
                  );

                  return (
                    <tr key={project.id}>
                      <td>
                        <div className={styles.projectCell}>
                          <AdminDashboardProjectThumbnail />
                          <div className={styles.projectMeta}>
                            <Link
                              href={`/admin/projects/${project.id}`}
                              className={styles.projectName}
                            >
                              {project.name}
                            </Link>
                            {project.location ? (
                              <span className={styles.projectSecondary}>
                                {project.location}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td>
                        <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
                      </td>
                      <td className={styles.muted}>
                        <time dateTime={project.updatedAt}>
                          {formatDateTime(project.updatedAt)}
                        </time>
                      </td>
                      <td className={styles.muted}>{project.itemCount}</td>
                      <td className={styles.actions}>
                        <AdminProjectRowActions projectId={project.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalProjects > projects.length ? (
            <p className={styles.footer}>
              מציג {projects.length} מתוך {totalProjects} פרויקטים
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
