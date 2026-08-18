import type { ProjectOnboardingStatus, ProjectStatus } from "@/types/project";
import { getLatestAdminFeedback } from "@/lib/projects/project-review-history";
import type { ProjectReviewHistoryEntry } from "@/types/project";
import FeedbackBanner from "@/components/ui/FeedbackBanner/FeedbackBanner";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { formatDateTime } from "@/lib/ui/format-date-time";
import {
  mapOnboardingStatusToBadge,
  mapProjectStatusToBadge,
} from "@/lib/ui/map-status-badge";
import styles from "./ProjectStatusBanner.module.scss";

type ProjectStatusBannerProps = {
  status: ProjectStatus;
  onboardingStatus?: ProjectOnboardingStatus | null;
  assignedClientFullName?: string | null;
  onboardingRejectionReason?: string | null;
  reviewHistory: ProjectReviewHistoryEntry[];
  submittedAt?: string;
};

function getCommercialBannerTone(
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

function getOnboardingBannerTone(
  onboardingStatus: ProjectOnboardingStatus,
): "info" | "success" | "warning" | "danger" {
  switch (onboardingStatus) {
    case "active":
      return "success";
    case "rejected":
      return "danger";
    case "pending_approval":
    default:
      return "warning";
  }
}

function getCommercialStatusCopy(status: ProjectStatus): string | null {
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

function getOnboardingStatusCopy(
  onboardingStatus: ProjectOnboardingStatus,
): string {
  switch (onboardingStatus) {
    case "pending_approval":
      return "הפרויקט ממתין לאישור מנהל המערכת.";
    case "active":
      return "הפרויקט פעיל — ניתן להוסיף מוצרים ולהמשיך לעבודה.";
    case "rejected":
      return "בקשת פתיחת הפרויקט נדחה. ניתן לערוך פרטים ולשלוח מחדש.";
    default:
      return "";
  }
}

export default function ProjectStatusBanner({
  status,
  onboardingStatus,
  assignedClientFullName,
  onboardingRejectionReason,
  reviewHistory,
  submittedAt,
}: ProjectStatusBannerProps) {
  const latestFeedback = getLatestAdminFeedback(reviewHistory);
  const hasOnboarding = onboardingStatus != null;

  if (hasOnboarding) {
    const onboardingBadge = mapOnboardingStatusToBadge(onboardingStatus);

    return (
      <FeedbackBanner tone={getOnboardingBannerTone(onboardingStatus)}>
        <p className={styles.statusLine}>
          <span className={styles.label}>סטטוס פתיחה:</span>
          <StatusBadge tone={onboardingBadge.tone}>
            {onboardingBadge.label}
          </StatusBadge>
        </p>

        {onboardingStatus === "active" && assignedClientFullName ? (
          <p className={styles.metaLine}>לקוח: {assignedClientFullName}</p>
        ) : null}

        <p>{getOnboardingStatusCopy(onboardingStatus)}</p>

        {onboardingStatus === "rejected" &&
        (onboardingRejectionReason || latestFeedback?.message) ? (
          <div className={styles.feedback}>
            <p className={styles.feedbackLabel}>משוב מהמנהל:</p>
            <p className={styles.feedbackMessage}>
              {onboardingRejectionReason ?? latestFeedback?.message}
            </p>
          </div>
        ) : null}
      </FeedbackBanner>
    );
  }

  const statusBadge = mapProjectStatusToBadge(status);
  const statusCopy = getCommercialStatusCopy(status);

  return (
    <FeedbackBanner tone={getCommercialBannerTone(status)}>
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
