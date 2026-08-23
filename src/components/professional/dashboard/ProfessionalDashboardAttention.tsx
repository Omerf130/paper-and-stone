import Link from "next/link";
import { formatUnreadMessageLabel } from "@/types/project-message";
import styles from "./ProfessionalDashboardAttention.module.scss";

type ProfessionalDashboardAttentionProps = {
  attentionProjectCount: number;
  stalePricingProjectCount: number;
  commercialDirtyProjectCount: number;
  changesRequestedCount: number;
  pendingOnboardingCount: number;
  unreadNotificationCount: number;
  unreadMessageCount: number;
  unreadClientMessageCount: number;
  profileIncomplete: boolean;
  workflowRejectedItemCount?: number;
  workflowResubmitItemCount?: number;
  workflowClientReviewItemCount?: number;
};

export default function ProfessionalDashboardAttention({
  attentionProjectCount,
  stalePricingProjectCount,
  commercialDirtyProjectCount,
  changesRequestedCount,
  pendingOnboardingCount,
  unreadNotificationCount,
  unreadMessageCount,
  unreadClientMessageCount,
  profileIncomplete,
  workflowRejectedItemCount = 0,
  workflowResubmitItemCount = 0,
  workflowClientReviewItemCount = 0,
}: ProfessionalDashboardAttentionProps) {
  const unreadClientLabel = formatUnreadMessageLabel(unreadClientMessageCount);

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
          {commercialDirtyProjectCount > 0 ? (
            <Link href="/professional/projects" className={styles.link}>
              {commercialDirtyProjectCount} פרויקטים — יש שינויים שטרם נשלחו לבדיקה
            </Link>
          ) : (
            <span className={styles.empty}>אין פרויקטים עם שינויים שלא נשלחו</span>
          )}
        </li>

        <li className={styles.item}>
          {changesRequestedCount > 0 ? (
            <Link href="/professional/projects" className={styles.link}>
              {changesRequestedCount} פרויקטים — נדרשים שינויים
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
          {workflowRejectedItemCount > 0 ? (
            <Link href="/professional/projects" className={styles.link}>
              {workflowRejectedItemCount === 1
                ? "לקוח דחה מוצר אחד"
                : `${workflowRejectedItemCount} מוצרים נדחו על ידי לקוח`}
            </Link>
          ) : (
            <span className={styles.empty}>אין מוצרים שנדחו על ידי לקוח</span>
          )}
        </li>

        <li className={styles.item}>
          {workflowResubmitItemCount > 0 ? (
            <Link href="/professional/projects" className={styles.link}>
              {workflowResubmitItemCount === 1
                ? "מוצר אחד דורש טיפול"
                : `${workflowResubmitItemCount} מוצרים דורשים טיפול`}
            </Link>
          ) : (
            <span className={styles.empty}>אין מוצרים שדורשים טיפול מחדש</span>
          )}
        </li>

        <li className={styles.item}>
          {workflowClientReviewItemCount > 0 ? (
            <span className={styles.info}>
              {workflowClientReviewItemCount === 1
                ? "מוצר אחד ממתין לאישור לקוח"
                : `${workflowClientReviewItemCount} מוצרים ממתינים לאישור לקוח`}
            </span>
          ) : (
            <span className={styles.empty}>אין מוצרים שממתינים לאישור לקוח</span>
          )}
        </li>

        <li className={styles.item}>
          {unreadClientLabel ? (
            <Link href="/professional/projects" className={styles.link}>
              {unreadClientLabel} מלקוחות
            </Link>
          ) : (
            <span className={styles.empty}>אין הודעות חדשות מלקוחות</span>
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
              {unreadMessageCount} הודעות חדשות ממנהל המערכת
            </Link>
          ) : (
            <span className={styles.empty}>אין הודעות חדשות ממנהל המערכת</span>
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
