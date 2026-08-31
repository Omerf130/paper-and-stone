import Link from "next/link";
import type { AdminDashboardMetrics } from "@/types/admin-dashboard";
import styles from "./AdminDashboardMetrics.module.scss";

type AdminDashboardMetricsProps = {
  metrics: AdminDashboardMetrics;
};

const METRIC_ITEMS: Array<{
  key: keyof AdminDashboardMetrics;
  label: string;
  href: string;
}> = [
  { key: "clients", label: "לקוחות", href: "/admin/clients" },
  { key: "architects", label: "אדריכלים", href: "/admin/architects" },
  { key: "projects", label: "פרויקטים", href: "/admin/projects" },
  {
    key: "activeProjects",
    label: "פעילים",
    href: "/admin/projects?queue=active",
  },
  {
    key: "attentionProjects",
    label: "דורשים טיפול",
    href: "/admin/projects?queue=attention",
  },
];

export default function AdminDashboardMetrics({
  metrics,
}: AdminDashboardMetricsProps) {
  return (
    <section className={styles.section} aria-labelledby="dashboard-metrics-title">
      <h2 id="dashboard-metrics-title" className={styles.title}>
        מבט על המערכת
      </h2>

      <ul className={styles.grid}>
        {METRIC_ITEMS.map((item) => (
          <li key={item.key}>
            <Link href={item.href} className={styles.block}>
              <span className={styles.value}>{metrics[item.key]}</span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
