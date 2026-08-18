import Link from "next/link";
import styles from "./ProfessionalDashboardAttention.module.scss";

type ProfessionalDashboardAttentionProps = {
  attentionProjectCount: number;
  stalePricingProjectCount: number;
  changesRequestedCount: number;
  pendingOnboardingCount: number;
  unreadNotificationCount: number;
  unreadMessageCount: number;
  profileIncomplete: boolean;
};

export default function ProfessionalDashboardAttention({
  attentionProjectCount,
  stalePricingProjectCount,
  changesRequestedCount,
  pendingOnboardingCount,
  unreadNotificationCount,
  unreadMessageCount,
  profileIncomplete,
}: ProfessionalDashboardAttentionProps) {
  return (
    <section className={styles.section} aria-labelledby="pro-attention-title">
      <h2 id="pro-attention-title" className={styles.title}>
        דורש טיפול
      </h2>

      <ul className={styles.list}>
        <li className={styles.item}>
          {stalePricingProjectCount > 0 ? (
            <Link href="/professional/projects" className={styles.link}>
              {stalePricingProjectCount} פרויקטים — מחיר לקוח דורש בדיקה
            </Link>
          ) : (
            <span className={styles.empty}>אין מחירי לקוח שדורשים בדיקה</span>
          )}
        </li>

        <li className={styles.item}>
          {changesRequestedCount > 0 ? (
            <Link href="/professional/projects" className={styles.link}>
              {changesRequestedCount} פרויקטים — האדמין ביקש שינויים
            </Link>
          ) : (
            <span className={styles.empty}>אין פרויקטים שדורשים שינויים</span>
          )}
        </li>

        <li className={styles.item}>
          {pendingOnboardingCount > 0 ? (
            <Link href="/professional/projects" className={styles.link}>
              {pendingOnboardingCount} פרויקטים ממתינים לאישור פתיחה
            </Link>
          ) : (
            <span className={styles.empty}>אין פרויקטים ממתינים לאישור פתיחה</span>
          )}
        </li>

        <li className={styles.item}>
          {unreadNotificationCount > 0 ? (
            <Link href="/professional/notifications" className={styles.link}>
              {unreadNotificationCount} התראות שלא נקראו
            </Link>
          ) : (
            <span className={styles.empty}>אין התראות חדשות</span>
          )}
        </li>

        <li className={styles.item}>
          {unreadMessageCount > 0 ? (
            <Link href="/professional/projects" className={styles.link}>
              {unreadMessageCount} הודעות חדשות בפרויקטים
            </Link>
          ) : (
            <span className={styles.empty}>אין הודעות חדשות</span>
          )}
        </li>

        {profileIncomplete ? (
          <li className={styles.item}>
            <Link href="/professional/profile" className={styles.link}>
              הפרופיל אינו מלא
            </Link>
          </li>
        ) : null}
      </ul>

      {attentionProjectCount > 0 ? (
        <p className={styles.summary}>{`${attentionProjectCount} פרויקטים דורשים טיפול`}</p>
      ) : null}
    </section>
  );
}
