import Link from "next/link";
import type { CSSProperties } from "react";
import type { AdminDashboardQueueSummary } from "@/types/admin-dashboard";
import styles from "./AdminDashboardProjectStatusOverview.module.scss";

type AdminDashboardProjectStatusOverviewProps = {
  summary: AdminDashboardQueueSummary;
};

const SEGMENTS: Array<{
  key: Exclude<keyof AdminDashboardQueueSummary, "all">;
  label: string;
  color: string;
}> = [
  { key: "active", label: "פעילים", color: "#8b7355" },
  { key: "attention", label: "דורשים טיפול", color: "#c4a574" },
  { key: "commercial", label: "בדיקה מסחרית", color: "#d8d4ce" },
  { key: "onboarding", label: "ממתינים לאישור", color: "#eceae6" },
];

function buildDonutStyle(summary: AdminDashboardQueueSummary): CSSProperties {
  const total = SEGMENTS.reduce((sum, segment) => sum + summary[segment.key], 0);

  if (total === 0) {
    return {
      background: `conic-gradient(${SEGMENTS[0]!.color} 0deg 360deg)`,
    };
  }

  let cursor = 0;
  const stops: string[] = [];

  for (const segment of SEGMENTS) {
    const value = summary[segment.key];
    if (value <= 0) {
      continue;
    }

    const start = (cursor / total) * 360;
    cursor += value;
    const end = (cursor / total) * 360;
    stops.push(`${segment.color} ${start}deg ${end}deg`);
  }

  return {
    background: `conic-gradient(${stops.join(", ")})`,
  };
}

export default function AdminDashboardProjectStatusOverview({
  summary,
}: AdminDashboardProjectStatusOverviewProps) {
  const donutStyle = buildDonutStyle(summary);

  return (
    <section className={styles.section} aria-labelledby="dashboard-status-title">
      <div className={styles.header}>
        <h2 id="dashboard-status-title" className={styles.title}>
          סקירת סטטוס פרויקטים
        </h2>
        <Link href="/admin/projects" className={styles.viewAll}>
          צפייה בפרויקטים →
        </Link>
      </div>

      <div className={styles.body}>
        <div className={styles.chartWrap}>
          <div className={styles.donut} style={donutStyle} aria-hidden="true">
            <div className={styles.donutHole}>
              <span className={styles.donutValue}>{summary.all}</span>
              <span className={styles.donutLabel}>סה״כ</span>
            </div>
          </div>
        </div>

        <ul className={styles.legend}>
          {SEGMENTS.map((segment) => (
            <li key={segment.key} className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ backgroundColor: segment.color }}
                aria-hidden="true"
              />
              <span className={styles.legendLabel}>{segment.label}</span>
              <span className={styles.legendValue}>{summary[segment.key]}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
