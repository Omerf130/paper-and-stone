import Link from "next/link";
import type { AdminDashboardRecentProject } from "@/types/admin-dashboard";
import { formatDateTime } from "@/lib/ui/format-date-time";
import styles from "./AdminDashboardRecentProjects.module.scss";

type AdminDashboardRecentProjectsProps = {
  projects: AdminDashboardRecentProject[];
};

export default function AdminDashboardRecentProjects({
  projects,
}: AdminDashboardRecentProjectsProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-labelledby="dashboard-recent-title">
      <h2 id="dashboard-recent-title" className={styles.title}>
        פרויקטים אחרונים
      </h2>

      <ul className={styles.list}>
        {projects.map((project) => (
          <li key={project.id} className={styles.item}>
            <Link href={`/admin/projects/${project.id}`} className={styles.link}>
              <span className={styles.name}>{project.name}</span>
              <time className={styles.date} dateTime={project.submittedAt}>
                {formatDateTime(project.submittedAt)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
