import AdminWorkspaceMetricCard from "@/components/admin/workspace/AdminWorkspaceMetricCard";
import styles from "./AdminProductLibraryMetrics.module.scss";

type AdminProductLibraryMetricsProps = {
  metrics: {
    total: number;
    visible: number;
    hidden: number;
    featured: number;
  };
};

function TotalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1" />
      <path d="M5 6h4M5 8.5h2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function VisibleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M1.5 7s2-3.5 5.5-3.5S12.5 7 12.5 7s-2 3.5-5.5 3.5S1.5 7 1.5 7Z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="7" cy="7" r="1.75" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function HiddenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2 2l10 10M5.5 5.8A2.2 2.2 0 0 0 7 9.2c1.2 0 2.2-1 2.2-2.2M3.8 4.3C2.6 5.1 1.5 7 1.5 7s2 3.5 5.5 3.5c.8 0 1.5-.2 2.1-.5M10.2 9.7C11.4 8.9 12.5 7 12.5 7s-2-3.5-5.5-3.5c-.8 0-1.5.2-2.1.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FeaturedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1.5 8.4 5.2l4 .3-3 2.6.9 3.9L7 10.2 3.7 12l.9-3.9-3-2.6 4-.3L7 1.5Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminProductLibraryMetrics({
  metrics,
}: AdminProductLibraryMetricsProps) {
  return (
    <section className={styles.grid} aria-label="מדדי מוצרים">
      <AdminWorkspaceMetricCard
        label="סה״כ מוצרים"
        value={metrics.total}
        href="/admin/products"
        icon={<TotalIcon />}
        appearance="dashboard"
        iconAccent="sand"
      />
      <AdminWorkspaceMetricCard
        label="גלויים"
        value={metrics.visible}
        href="/admin/products?visibility=visible"
        icon={<VisibleIcon />}
        appearance="dashboard"
        iconAccent="sage"
      />
      <AdminWorkspaceMetricCard
        label="מוסתרים"
        value={metrics.hidden}
        href="/admin/products?visibility=hidden"
        icon={<HiddenIcon />}
        appearance="dashboard"
        iconAccent="blush"
      />
      <AdminWorkspaceMetricCard
        label="מומלצים"
        value={metrics.featured}
        href="/admin/products?featured=featured"
        icon={<FeaturedIcon />}
        appearance="dashboard"
        iconAccent="gold"
      />
    </section>
  );
}
