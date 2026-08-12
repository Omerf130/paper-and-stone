import type { ProjectStatus } from "@/types/project";
import { getLatestAdminFeedback } from "@/lib/projects/project-review-history";
import type { ProjectReviewHistoryEntry } from "@/types/project";
import { getProjectStatusLabel } from "@/lib/projects/project-display-helpers";
import styles from "./ProjectStatusBanner.module.scss";

type ProjectStatusBannerProps = {
  status: ProjectStatus;
  reviewHistory: ProjectReviewHistoryEntry[];
  submittedAt?: string;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ProjectStatusBanner({
  status,
  reviewHistory,
  submittedAt,
}: ProjectStatusBannerProps) {
  const latestFeedback = getLatestAdminFeedback(reviewHistory);

  return (
    <section className={styles.banner} aria-label="סטטוס פרויקט">
      <p className={styles.statusLine}>
        <span className={styles.label}>סטטוס:</span>
        <span>{getProjectStatusLabel(status)}</span>
      </p>

      {submittedAt && status !== "draft" ? (
        <p className={styles.metaLine}>
          נשלח: {formatDate(submittedAt)}
        </p>
      ) : null}

      {status === "submitted" ? (
        <p className={styles.info} role="status">
          הפרויקט נמצא בבדיקה. לא ניתן לערוך עד לקבלת תשובה.
        </p>
      ) : null}

      {status === "approved" ? (
        <p className={styles.success} role="status">
          הפרויקט אושר.
        </p>
      ) : null}

      {status === "rejected" ? (
        <p className={styles.error} role="status">
          הפרויקט נדחה.
        </p>
      ) : null}

      {status === "changes_requested" ? (
        <p className={styles.info} role="status">
          נדרשים שינויים. ניתן לערוך ולשלוח מחדש.
        </p>
      ) : null}

      {latestFeedback?.message &&
      (status === "changes_requested" || status === "rejected") ? (
        <div className={styles.feedback}>
          <p className={styles.feedbackLabel}>משוב אחרון מהמנהל:</p>
          <p className={styles.feedbackMessage}>{latestFeedback.message}</p>
        </div>
      ) : null}
    </section>
  );
}
