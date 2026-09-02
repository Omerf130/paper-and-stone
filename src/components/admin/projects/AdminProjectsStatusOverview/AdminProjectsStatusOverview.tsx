import type { AdminProjectsQueueSummary } from "@/lib/projects/getAdminProjects";
import styles from "./AdminProjectsStatusOverview.module.scss";

type AdminProjectsStatusOverviewProps = {
  summary: AdminProjectsQueueSummary;
};

const ITEMS: Array<{
  key: keyof AdminProjectsQueueSummary;
  label: string;
}> = [
  { key: "all", label: "סה״כ" },
  { key: "active", label: "פעילים" },
  { key: "attention", label: "דורשים טיפול" },
  { key: "commercial", label: "ממתינים לבדיקה" },
  { key: "onboarding", label: "ממתינים לאישור" },
];

export default function AdminProjectsStatusOverview({
  summary,
}: AdminProjectsStatusOverviewProps) {
  return (
    <div className={styles.overview} aria-label="סיכום סטטוס פרויקטים">
      {ITEMS.map((item, index) => (
        <span key={item.key} className={styles.item}>
          {index > 0 ? (
            <span className={styles.separator} aria-hidden="true">
              ·
            </span>
          ) : null}
          <span className={styles.value}>{summary[item.key]}</span>
          <span className={styles.label}>{item.label}</span>
        </span>
      ))}
    </div>
  );
}
