import Link from "next/link";
import tableStyles from "@/components/admin/list/admin-table.module.scss";
import styles from "./AdminProjectRowActions.module.scss";

type AdminProjectRowActionsProps = {
  projectId: string;
};

export default function AdminProjectRowActions({
  projectId,
}: AdminProjectRowActionsProps) {
  return (
    <details className={styles.menu}>
      <summary className={styles.trigger} aria-label="פעולות פרויקט">
        ⋯
      </summary>
      <div className={styles.panel}>
        <Link href={`/admin/projects/${projectId}`} className={tableStyles.actionLink}>
          פתיחת פרויקט
        </Link>
      </div>
    </details>
  );
}
