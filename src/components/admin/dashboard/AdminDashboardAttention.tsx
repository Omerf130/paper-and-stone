import Link from "next/link";
import styles from "./AdminDashboardAttention.module.scss";

type AdminDashboardAttentionProps = {
  submittedProjectCount: number;
  unreadAdminMessageCount: number;
  quoteAcceptedAwaitingApprovalCount: number;
  quoteChangeRequestedCount: number;
  quoteAwaitingProfessionalCount: number;
};

export default function AdminDashboardAttention({
  submittedProjectCount,
  unreadAdminMessageCount,
  quoteAcceptedAwaitingApprovalCount,
  quoteChangeRequestedCount,
  quoteAwaitingProfessionalCount,
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
        <li className={styles.item}>
          {quoteAcceptedAwaitingApprovalCount > 0 ? (
            <Link href="/admin/projects" className={styles.link}>
              {quoteAcceptedAwaitingApprovalCount} הצעות מחיר אושרו — ממתינות
              לאישור סופי
            </Link>
          ) : (
            <span className={styles.empty}>
              אין הצעות מחיר שממתינות לאישור סופי
            </span>
          )}
        </li>

        <li className={styles.item}>
          {quoteChangeRequestedCount > 0 ? (
            <Link href="/admin/projects" className={styles.link}>
              {quoteChangeRequestedCount} בקשות שינוי תמחור
            </Link>
          ) : (
            <span className={styles.empty}>אין בקשות שינוי תמחור</span>
          )}
        </li>

        <li className={styles.item}>
          {quoteAwaitingProfessionalCount > 0 ? (
            <Link href="/admin/projects" className={styles.link}>
              {quoteAwaitingProfessionalCount} הצעות מחיר ממתינות לתגובת איש
              מקצוע
            </Link>
          ) : (
            <span className={styles.empty}>
              אין הצעות מחיר שממתינות לתגובת איש מקצוע
            </span>
          )}
        </li>
      </ul>
    </section>
  );
}
