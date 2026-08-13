import type { ProjectReviewHistoryEntry } from "@/types/project";
import { getProjectReviewActionLabel } from "@/lib/projects/project-display-helpers";
import { formatDateTime } from "@/lib/ui/format-date-time";
import styles from "./ProjectReviewHistory.module.scss";

type ProjectReviewHistoryProps = {
  history: ProjectReviewHistoryEntry[];
};

export default function ProjectReviewHistory({
  history,
}: ProjectReviewHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <ol className={styles.list}>
      {history.map((entry, index) => (
        <li key={`${entry.createdAt}-${index}`} className={styles.item}>
          <div className={styles.header}>
            <span>{getProjectReviewActionLabel(entry.action)}</span>
            <time dateTime={entry.createdAt}>{formatDateTime(entry.createdAt)}</time>
          </div>
          {entry.message ? (
            <p className={styles.message}>{entry.message}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
