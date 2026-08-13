import type { AdminDashboardMetrics } from "@/types/admin-dashboard";
import styles from "./AdminDashboardMetrics.module.scss";

type AdminDashboardMetricsProps = {
  metrics: AdminDashboardMetrics;
};

const METRIC_ITEMS: Array<{
  key: keyof AdminDashboardMetrics;
  label: string;
}> = [
  { key: "activeProducts", label: "מוצרים פעילים" },
  { key: "featuredProducts", label: "מוצרים מומלצים" },
  { key: "activeCategories", label: "קטגוריות פעילות" },
  { key: "activeMaterials", label: "חומרים פעילים" },
  { key: "activeColors", label: "צבעים פעילים" },
  { key: "activeProfessionals", label: "אנשי מקצוע פעילים" },
];

export default function AdminDashboardMetrics({
  metrics,
}: AdminDashboardMetricsProps) {
  return (
    <section className={styles.section} aria-labelledby="dashboard-metrics-title">
      <h2 id="dashboard-metrics-title" className={styles.title}>
        מבט על המערכת
      </h2>

      <dl className={styles.grid}>
        {METRIC_ITEMS.map((item) => (
          <div key={item.key} className={styles.metric}>
            <dt className={styles.label}>{item.label}</dt>
            <dd className={styles.value}>{metrics[item.key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
