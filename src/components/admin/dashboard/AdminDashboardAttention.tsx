import Link from "next/link";
import styles from "./AdminDashboardAttention.module.scss";

type AdminDashboardAttentionProps = {
  submittedProjectCount: number;
  unreadAdminMessageCount: number;
};

export default function AdminDashboardAttention({
  submittedProjectCount,
  unreadAdminMessageCount,
}: AdminDashboardAttentionProps) {
  return (
    <section className={styles.section} aria-labelledby="dashboard-attention-title">
      <h2 id="dashboard-attention-title" className={styles.title}>
        דרוש טיפול
      </h2>

      <ul className={styles.list}>
        <li className={styles.item}>
          {submittedProjectCount > 0 ? (
            <Link href="/admin/projects" className={styles.link}>
              {submittedProjectCount} פרויקטים ממתינים לבדיקה
            </Link>
          ) : (
            <span className={styles.empty}>
              אין כרגע פרויקטים שממתינים לבדיקה
            </span>
          )}
        </li>

        <li className={styles.item}>
          {unreadAdminMessageCount > 0 ? (
            <Link href="/admin/projects" className={styles.link}>
              {unreadAdminMessageCount} הודעות חדשות בפרויקטים
            </Link>
          ) : (
            <span className={styles.empty}>אין הודעות חדשות</span>
          )}
        </li>
      </ul>
    </section>
  );
}
