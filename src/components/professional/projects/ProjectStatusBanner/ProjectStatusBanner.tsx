import type { ProjectStatus } from "@/types/project";
import { getLatestAdminFeedback } from "@/lib/projects/project-review-history";
import type { ProjectReviewHistoryEntry } from "@/types/project";
import FeedbackBanner from "@/components/ui/FeedbackBanner/FeedbackBanner";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { mapProjectStatusToBadge } from "@/lib/ui/map-status-badge";
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

function getBannerTone(
  status: ProjectStatus,
): "info" | "success" | "warning" | "danger" {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    case "changes_requested":
      return "warning";
    default:
      return "info";
  }
}

export default function ProjectStatusBanner({
  status,
  reviewHistory,
  submittedAt,
}: ProjectStatusBannerProps) {
  const latestFeedback = getLatestAdminFeedback(reviewHistory);
  const statusBadge = mapProjectStatusToBadge(status);

  return (
    <FeedbackBanner tone={getBannerTone(status)}>
      <p className={styles.statusLine}>
        <span className={styles.label}>סטטוס:</span>
        <StatusBadge tone={statusBadge.tone}>{statusBadge.label}</StatusBadge>
      </p>

      {submittedAt && status !== "draft" ? (
        <p className={styles.metaLine}>נשלח: {formatDate(submittedAt)}</p>
      ) : null}

      {status === "submitted" ? (
        <p>הפרויקט נמצא בבדיקה. לא ניתן לערוך עד לקבלת תשובה.</p>
      ) : null}

      {status === "approved" ? <p>הפרויקט אושר.</p> : null}

      {status === "rejected" ? <p>הפרויקט נדחה.</p> : null}

      {status === "changes_requested" ? (
        <p>נדרשים שינויים. ניתן לערוך ולשלוח מחדש.</p>
      ) : null}

      {latestFeedback?.message &&
      (status === "changes_requested" || status === "rejected") ? (
        <div className={styles.feedback}>
          <p className={styles.feedbackLabel}>משוב אחרון מהמנהל:</p>
          <p className={styles.feedbackMessage}>{latestFeedback.message}</p>
        </div>
      ) : null}
    </FeedbackBanner>
  );
}
