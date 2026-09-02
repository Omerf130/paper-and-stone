import Button from "@/components/ui/Button/Button";
import AdminProjectsStatusOverview from "@/components/admin/projects/AdminProjectsStatusOverview/AdminProjectsStatusOverview";
import type { AdminProjectsQueueSummary } from "@/lib/projects/getAdminProjects";
import styles from "./AdminProjectsPageHeader.module.scss";

type AdminProjectsPageHeaderProps = {
  summary: AdminProjectsQueueSummary;
};

export default function AdminProjectsPageHeader({
  summary,
}: AdminProjectsPageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        <h1 className={styles.title}>פרויקטים</h1>
        <AdminProjectsStatusOverview summary={summary} />
      </div>
      <Button href="/admin/projects/new" size="sm" className={styles.cta}>
        + פרויקט חדש
      </Button>
    </header>
  );
}
