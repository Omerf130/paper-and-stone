import Link from "next/link";
import type { ReactNode } from "react";
import { combineIconAccentClasses, type AdminIconAccent } from "@/types/admin-icon-accent";
import styles from "./AdminDashboardMetricCard.module.scss";

type AdminDashboardMetricCardProps = {
  label: string;
  value: number | string;
  icon: ReactNode;
  href: string;
  actionLabel?: string;
  iconAccent?: AdminIconAccent;
};

export default function AdminDashboardMetricCard({
  label,
  value,
  icon,
  href,
  actionLabel = "צפייה →",
  iconAccent,
}: AdminDashboardMetricCardProps) {
  return (
    <Link href={href} className={styles.card}>
      <span
        className={combineIconAccentClasses(styles.iconWrap, styles, iconAccent)}
      >
        {icon}
      </span>
      <div className={styles.body}>
        <p className={styles.value}>{value}</p>
        <p className={styles.label}>{label}</p>
        <span className={styles.action}>{actionLabel}</span>
      </div>
    </Link>
  );
}
