import Link from "next/link";
import type { ReactNode } from "react";
import { combineIconAccentClasses, type AdminIconAccent } from "@/types/admin-icon-accent";
import styles from "./AdminWorkspaceMetricCard.module.scss";

type AdminWorkspaceMetricCardProps = {
  label: string;
  value: number | string;
  icon?: ReactNode;
  href?: string;
  actionLabel?: string;
  appearance?: "default" | "dashboard";
  iconAccent?: AdminIconAccent;
};

export default function AdminWorkspaceMetricCard({
  label,
  value,
  icon,
  href,
  actionLabel = "צפייה →",
  appearance = "default",
  iconAccent,
}: AdminWorkspaceMetricCardProps) {
  const cardClass =
    appearance === "dashboard"
      ? `${styles.card} ${styles.cardDashboard}`
      : styles.card;

  const iconWrapClass =
    appearance === "dashboard"
      ? combineIconAccentClasses(styles.iconWrapDashboard, styles, iconAccent)
      : iconAccent
        ? combineIconAccentClasses(styles.iconWrap, styles, iconAccent)
        : styles.iconWrap;

  const content = (
    <>
      {icon ? <span className={iconWrapClass}>{icon}</span> : null}
      <div className={styles.content}>
        <p className={styles.value}>{value}</p>
        <p className={styles.label}>{label}</p>
      </div>
      {href ? <p className={styles.action}>{actionLabel}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {content}
      </Link>
    );
  }

  return <div className={`${cardClass} ${styles.cardStatic}`}>{content}</div>;
}

type AdminWorkspaceMetricStripItemProps = {
  label: string;
  value: number | string;
};

export function AdminWorkspaceMetricStripItem({
  label,
  value,
}: AdminWorkspaceMetricStripItemProps) {
  return (
    <div className={styles.stripItem}>
      <p className={styles.stripValue}>{value}</p>
      <p className={styles.stripLabel}>{label}</p>
    </div>
  );
}
