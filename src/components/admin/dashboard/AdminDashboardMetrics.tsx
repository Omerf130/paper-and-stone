import type { ReactNode } from "react";
import AdminDashboardMetricCard from "@/components/admin/dashboard/AdminDashboardMetricCard";
import {
  MetricArchitectsIcon,
  MetricAttentionIcon,
  MetricClientsIcon,
  MetricProjectsIcon,
} from "@/components/ui/icons/admin-icons";
import type { AdminDashboardMetrics } from "@/types/admin-dashboard";
import type { AdminIconAccent } from "@/types/admin-icon-accent";
import styles from "./AdminDashboardMetrics.module.scss";

type AdminDashboardMetricsProps = {
  metrics: AdminDashboardMetrics;
};

const METRIC_ITEMS: Array<{
  key: keyof AdminDashboardMetrics;
  label: string;
  href: string;
  icon: ReactNode;
  iconAccent: AdminIconAccent;
}> = [
  {
    key: "clients",
    label: "לקוחות",
    href: "/admin/clients",
    icon: <MetricClientsIcon />,
    iconAccent: "blue",
  },
  {
    key: "architects",
    label: "אדריכלים",
    href: "/admin/architects",
    icon: <MetricArchitectsIcon />,
    iconAccent: "blush",
  },
  {
    key: "projects",
    label: "פרויקטים",
    href: "/admin/projects?queue=all",
    icon: <MetricProjectsIcon />,
    iconAccent: "sand",
  },
  {
    key: "activeProjects",
    label: "פרויקטים פעילים",
    href: "/admin/projects?queue=active",
    icon: <MetricProjectsIcon />,
    iconAccent: "sage",
  },
  {
    key: "attentionProjects",
    label: "דורשים טיפול",
    href: "/admin/projects?queue=attention",
    icon: <MetricAttentionIcon />,
    iconAccent: "gold",
  },
];

export default function AdminDashboardMetrics({
  metrics,
}: AdminDashboardMetricsProps) {
  return (
    <section className={styles.section} aria-label="מדדי מערכת">
      <ul className={styles.grid}>
        {METRIC_ITEMS.map((item) => (
          <li key={item.key}>
            <AdminDashboardMetricCard
              label={item.label}
              value={metrics[item.key]}
              href={item.href}
              icon={item.icon}
              iconAccent={item.iconAccent}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
