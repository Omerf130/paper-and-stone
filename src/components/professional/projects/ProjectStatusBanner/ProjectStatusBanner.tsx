import type { ProjectStatus } from "@/types/project";
import { getLatestAdminFeedback } from "@/lib/projects/project-review-history";
import type { ProjectReviewHistoryEntry } from "@/types/project";
import FeedbackBanner from "@/components/ui/FeedbackBanner/FeedbackBanner";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { formatDateTime } from "@/lib/ui/format-date-time";
import { mapProjectStatusToBadge } from "@/lib/ui/map-status-badge";
import styles from "./ProjectStatusBanner.module.scss";

type ProjectStatusBannerProps = {
  status: ProjectStatus;
  reviewHistory: ProjectReviewHistoryEntry[];
  submittedAt?: string;
};

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

function getStatusCopy(status: ProjectStatus): string | null {
  switch (status) {
    case "draft":
      return "ניתן להמשיך לערוך ולשלוח לבדיקה.";
    case "submitted":
      return "הפרויקט נשלח וממתין לבדיקה. לא ניתן לערוך עד לקבלת תשובה.";
    case "changes_requested":
      return "האדמין ביקש שינויים — ניתן לערוך ולשלוח מחדש.";
    case "approved":
      return "הפרויקט אושר.";
    case "rejected":
      return "הפרויקט נדחה.";
    default:
      return null;
  }
}

export default function ProjectStatusBanner({
  status,
  reviewHistory,
  submittedAt,
}: ProjectStatusBannerProps) {
  const latestFeedback = getLatestAdminFeedback(reviewHistory);
  const statusBadge = mapProjectStatusToBadge(status);
  const statusCopy = getStatusCopy(status);

  return (
    <FeedbackBanner tone={getBannerTone(status)}>
      <p className={styles.statusLine}>
        <span className={styles.label}>סטטוס:</span>
        <StatusBadge tone={statusBadge.tone}>{statusBadge.label}</StatusBadge>
      </p>

      {submittedAt && status !== "draft" ? (
        <p className={styles.metaLine}>נשלח: {formatDateTime(submittedAt)}</p>
      ) : null}

      {statusCopy ? <p>{statusCopy}</p> : null}

      {latestFeedback?.message &&
      (status === "changes_requested" || status === "rejected") ? (
        <div className={styles.feedback}>
          <p className={styles.feedbackLabel}>משוב מהמנהל:</p>
          <p className={styles.feedbackMessage}>{latestFeedback.message}</p>
        </div>
      ) : null}
    </FeedbackBanner>
  );
}
