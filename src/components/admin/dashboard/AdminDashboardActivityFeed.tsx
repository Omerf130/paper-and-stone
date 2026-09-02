import Link from "next/link";
import type { AdminDashboardActivityEntry } from "@/types/admin-dashboard";
import {
  combineIconAccentClasses,
  type AdminIconSemanticAccent,
} from "@/types/admin-icon-accent";
import { formatRelativeTime } from "@/lib/ui/format-relative-time";
import styles from "./AdminDashboardActivityFeed.module.scss";

type AdminDashboardActivityFeedProps = {
  entries: AdminDashboardActivityEntry[];
  attentionProjectCount: number;
};

function activityIconAccent(kind: AdminDashboardActivityEntry["kind"]): AdminIconSemanticAccent {
  switch (kind) {
    case "project_submitted":
      return "success";
    case "client_request":
    case "architect_request":
      return "info";
    case "project_updated":
    default:
      return "neutral";
  }
}

function ActivityIcon({ kind }: { kind: AdminDashboardActivityEntry["kind"] }) {
  switch (kind) {
    case "project_submitted":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M3 7.5L5.5 10L11 4"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "client_request":
    case "architect_request":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M7 7C8.10457 7 9 6.10457 9 5C9 3.89543 8.10457 3 7 3C5.89543 3 5 3.89543 5 5C5 6.10457 5.89543 7 7 7Z"
            stroke="currentColor"
            strokeWidth="1.1"
          />
          <path
            d="M2.5 11.5V10.5C2.5 9.11929 3.61929 8 5 8H9C10.3807 8 11.5 9.11929 11.5 10.5V11.5"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>
      );
    case "project_updated":
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M2.5 4.5H11.5M2.5 7H8.5M2.5 9.5H6.5"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export default function AdminDashboardActivityFeed({
  entries,
  attentionProjectCount,
}: AdminDashboardActivityFeedProps) {
  const viewAllHref =
    attentionProjectCount > 0 ? "/admin/projects?queue=attention" : null;

  return (
    <section className={styles.section} aria-labelledby="dashboard-activity-title">
      <div className={styles.header}>
        <h2 id="dashboard-activity-title" className={styles.title}>
          פעילות אחרונה
        </h2>
        {viewAllHref ? (
          <Link href={viewAllHref} className={styles.viewAll}>
            צפייה בהכל →
          </Link>
        ) : null}
      </div>

      {entries.length === 0 ? (
        <p className={styles.empty}>אין פעילות להצגה כרגע</p>
      ) : (
        <ul className={styles.feed}>
          {entries.map((entry) => (
            <li key={entry.id} className={styles.item}>
              <span
                className={combineIconAccentClasses(
                  styles.icon,
                  styles,
                  activityIconAccent(entry.kind),
                )}
                aria-hidden="true"
              >
                <ActivityIcon kind={entry.kind} />
              </span>
              <div className={styles.content}>
                {entry.href ? (
                  <Link href={entry.href} className={styles.primary}>
                    {entry.primary}
                  </Link>
                ) : (
                  <span className={styles.primary}>{entry.primary}</span>
                )}
                <span className={styles.secondary}>{entry.secondary}</span>
              </div>
              <time className={styles.time} dateTime={entry.timestamp}>
                {formatRelativeTime(entry.timestamp)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
