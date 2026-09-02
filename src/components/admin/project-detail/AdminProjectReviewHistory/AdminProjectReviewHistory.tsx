import { getProjectReviewActionLabel } from "@/lib/projects/project-display-helpers";
import { formatDateTime } from "@/lib/ui/format-date-time";
import type { ProjectReviewHistoryEntry } from "@/types/project";
import styles from "./AdminProjectReviewHistory.module.scss";

type AdminProjectReviewHistoryProps = {
  history: ProjectReviewHistoryEntry[];
};

export default function AdminProjectReviewHistory({
  history,
}: AdminProjectReviewHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  const entries = [...history].reverse();

  return (
    <ol className={styles.list}>
      {entries.map((entry, index) => (
        <li key={`${entry.createdAt}-${index}`} className={styles.item}>
          <span className={styles.indicator} aria-hidden="true" />
          <div className={styles.content}>
            <div className={styles.header}>
              <span className={styles.action}>
                {getProjectReviewActionLabel(entry.action)}
              </span>
              <time className={styles.time} dateTime={entry.createdAt}>
                {formatDateTime(entry.createdAt)}
              </time>
            </div>
            {entry.message ? (
              <p className={styles.message}>{entry.message}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
