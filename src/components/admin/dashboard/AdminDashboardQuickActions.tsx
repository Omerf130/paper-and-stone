import Link from "next/link";
import type { ReactNode } from "react";
import {
  MetricClientsIcon,
  MetricProductsIcon,
  MetricProjectsIcon,
} from "@/components/ui/icons/admin-icons";
import { combineIconAccentClasses, type AdminIconAccent } from "@/types/admin-icon-accent";
import styles from "./AdminDashboardQuickActions.module.scss";

const ACTIONS: Array<{
  href: string;
  label: string;
  icon: ReactNode;
  iconAccent: AdminIconAccent;
}> = [
  {
    href: "/admin/products",
    label: "ספריית מוצרים",
    icon: <MetricProductsIcon />,
    iconAccent: "sand",
  },
  {
    href: "/admin/materials",
    label: "חומרים",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d="M2.5 4.5H11.5V10.5H2.5V4.5Z"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
        <path d="M2.5 7H11.5" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    ),
    iconAccent: "sage",
  },
  {
    href: "/admin/projects",
    label: "פרויקטים",
    icon: <MetricProjectsIcon />,
    iconAccent: "blue",
  },
  {
    href: "/admin/categories",
    label: "קטגוריות",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d="M2.5 3.5H5.5V6.5H2.5V3.5ZM8.5 3.5H11.5V6.5H8.5V3.5ZM2.5 8.5H5.5V11.5H2.5V8.5ZM8.5 8.5H11.5V11.5H8.5V8.5Z"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </svg>
    ),
    iconAccent: "blush",
  },
  {
    href: "/admin/clients",
    label: "לקוחות",
    icon: <MetricClientsIcon />,
    iconAccent: "gold",
  },
];

export default function AdminDashboardQuickActions() {
  return (
    <section className={styles.section} aria-labelledby="dashboard-actions-title">
      <h2 id="dashboard-actions-title" className={styles.title}>
        גישה מהירה
      </h2>

      <div className={styles.actions}>
        {ACTIONS.map((action) => (
          <Link key={action.href} href={action.href} className={styles.action}>
            <span
              className={combineIconAccentClasses(
                styles.actionIcon,
                styles,
                action.iconAccent,
              )}
              aria-hidden="true"
            >
              {action.icon}
            </span>
            <span className={styles.actionLabel}>{action.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
