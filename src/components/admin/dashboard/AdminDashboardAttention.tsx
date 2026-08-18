import Link from "next/link";
import styles from "./AdminDashboardAttention.module.scss";

type AdminDashboardAttentionProps = {
  attentionProjectCount: number;
  activeProjectCount: number;
  submittedProjectCount: number;
  pendingOnboardingProjectCount: number;
  unreadAdminMessageCount: number;
  quoteAcceptedAwaitingApprovalCount: number;
  quoteChangeRequestedCount: number;
  quoteAwaitingArchitectCount: number;
  pendingArchitectRequestCount: number;
};

export default function AdminDashboardAttention({
  attentionProjectCount,
  activeProjectCount,
  submittedProjectCount,
  pendingOnboardingProjectCount,
  unreadAdminMessageCount,
  quoteAcceptedAwaitingApprovalCount,
  quoteChangeRequestedCount,
  quoteAwaitingArchitectCount,
  pendingArchitectRequestCount,
}: AdminDashboardAttentionProps) {
  return (
    <section className={styles.section} aria-labelledby="dashboard-attention-title">
      <h2 id="dashboard-attention-title" className={styles.title}>
        דרוש טיפול
      </h2>

      <ul className={styles.list}>
        <li className={styles.item}>
          {attentionProjectCount > 0 ? (
            <Link href="/admin/projects?queue=attention" className={styles.link}>
              {attentionProjectCount} פרויקטים דורשים טיפול
            </Link>
          ) : (
            <span className={styles.empty}>אין פרויקטים שדורשים טיפול כרגע</span>
          )}
        </li>

        <li className={styles.item}>
          {activeProjectCount > 0 ? (
            <Link href="/admin/projects?queue=active" className={styles.link}>
              {activeProjectCount} פרויקטים פעילים בעבודה
            </Link>
          ) : (
            <span className={styles.empty}>אין פרויקטים פעילים</span>
          )}
        </li>

        <li className={styles.item}>
          {pendingArchitectRequestCount > 0 ? (
            <Link href="/admin/architect-requests" className={styles.link}>
              בקשות אדריכל שממתינות לטיפול: {pendingArchitectRequestCount}
            </Link>
          ) : (
            <span className={styles.empty}>
              אין כרגע בקשות אדריכל ממתינות
            </span>
          )}
        </li>

        <li className={styles.item}>
          {pendingOnboardingProjectCount > 0 ? (
            <Link
              href="/admin/projects?queue=onboarding"
              className={styles.link}
            >
              פרויקטים שממתינים לאישור פתיחה: {pendingOnboardingProjectCount}
            </Link>
          ) : (
            <span className={styles.empty}>
              אין פרויקטים שממתינים לאישור פתיחה
            </span>
          )}
        </li>

        <li className={styles.item}>
          {submittedProjectCount > 0 ? (
            <Link href="/admin/projects?queue=commercial" className={styles.link}>
              {submittedProjectCount} פרויקטים ממתינים לבדיקה מסחרית
            </Link>
          ) : (
            <span className={styles.empty}>
              אין כרגע פרויקטים שממתינים לבדיקה
            </span>
          )}
        </li>

        <li className={styles.item}>
          {unreadAdminMessageCount > 0 ? (
            <Link href="/admin/projects?queue=attention" className={styles.link}>
              {unreadAdminMessageCount} הודעות חדשות בפרויקטים
            </Link>
          ) : (
            <span className={styles.empty}>אין הודעות חדשות</span>
          )}
        </li>
        <li className={styles.item}>
          {quoteAcceptedAwaitingApprovalCount > 0 ? (
            <Link href="/admin/projects?queue=commercial" className={styles.link}>
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
            <Link href="/admin/projects?queue=commercial" className={styles.link}>
              {quoteChangeRequestedCount} בקשות שינוי תמחור
            </Link>
          ) : (
            <span className={styles.empty}>אין בקשות שינוי תמחור</span>
          )}
        </li>

        <li className={styles.item}>
          {quoteAwaitingArchitectCount > 0 ? (
            <Link href="/admin/projects?queue=commercial" className={styles.link}>
              {quoteAwaitingArchitectCount} הצעות מחיר ממתינות לתגובת אדריכל
            </Link>
          ) : (
            <span className={styles.empty}>
              אין הצעות מחיר שממתינות לתגובת אדריכל
            </span>
          )}
        </li>
      </ul>
    </section>
  );
}
