import type { ProjectReviewHistoryEntry } from "@/types/project";
import { getProjectReviewActionLabel } from "@/lib/projects/project-display-helpers";
import styles from "./ProjectReviewHistory.module.scss";

type ProjectReviewHistoryProps = {
  history: ProjectReviewHistoryEntry[];
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ProjectReviewHistory({
  history,
}: ProjectReviewHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-labelledby="project-history-title">
      <h2 id="project-history-title" className={styles.title}>
        היסטוריית שליחה ובדיקה
      </h2>
      <ol className={styles.list}>
        {history.map((entry, index) => (
          <li key={`${entry.createdAt}-${index}`} className={styles.item}>
            <div className={styles.header}>
              <span>{getProjectReviewActionLabel(entry.action)}</span>
              <time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time>
            </div>
            {entry.message ? (
              <p className={styles.message}>{entry.message}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
