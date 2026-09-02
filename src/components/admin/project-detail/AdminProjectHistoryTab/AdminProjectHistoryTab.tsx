import AdminProjectReviewHistory from "@/components/admin/project-detail/AdminProjectReviewHistory/AdminProjectReviewHistory";
import type { AdminProjectDetailWithThumbnails } from "@/lib/projects/getAdminProjects";
import styles from "./AdminProjectHistoryTab.module.scss";

type AdminProjectHistoryTabProps = {
  project: AdminProjectDetailWithThumbnails;
};

export default function AdminProjectHistoryTab({ project }: AdminProjectHistoryTabProps) {
  if (project.reviewHistory.length === 0) {
    return (
      <div className={styles.tab}>
        <div className={styles.panel}>
          <p className={styles.empty}>אין היסטוריית בדיקות לפרויקט זה.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tab}>
      <section className={styles.panel} aria-labelledby="history-title">
        <h2 id="history-title" className={styles.title}>
          היסטוריית בדיקות
        </h2>
        <AdminProjectReviewHistory history={project.reviewHistory} />
      </section>
    </div>
  );
}
