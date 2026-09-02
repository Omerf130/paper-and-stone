import AdminWorkspaceMetricCard from "@/components/admin/workspace/AdminWorkspaceMetricCard";
import type { AdminProjectDetailWithThumbnails } from "@/lib/projects/getAdminProjects";
import styles from "./AdminProjectWorkspaceMetrics.module.scss";

type AdminProjectWorkspaceMetricsProps = {
  project: AdminProjectDetailWithThumbnails;
  projectHref: string;
};

function ItemsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1" />
      <path d="M5 6h4M5 8.5h2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1" />
      <path d="M7 4.5v5M5.5 6h2.5a1 1 0 1 1 0 2H5.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function PaidIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2.5 7.5 5.5 10.5 11.5 4.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RemainingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1" />
      <path d="M7 4.5v3l2 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function ProfitIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3 10.5 7 3.5l4 7"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4.5 8.5h5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export default function AdminProjectWorkspaceMetrics({
  project,
  projectHref,
}: AdminProjectWorkspaceMetricsProps) {
  const totals = project.pricingTotals;
  const payment = project.paymentSummary;

  return (
    <section className={styles.grid} aria-label="מדדי פרויקט">
      <AdminWorkspaceMetricCard
        label="פריטים"
        value={project.items.length}
        icon={<ItemsIcon />}
        href={`${projectHref}?tab=summary`}
        actionLabel="צפייה →"
        appearance="dashboard"
        iconAccent="sand"
      />
      <AdminWorkspaceMetricCard
        label="סה״כ לקוח"
        value={totals?.clientTotalInclVatFormatted ?? "—"}
        icon={<MoneyIcon />}
        href={`${projectHref}?tab=costs`}
        actionLabel="עלויות →"
        appearance="dashboard"
        iconAccent="blue"
      />
      <AdminWorkspaceMetricCard
        label="שולם"
        value={payment?.totalPaidFormatted ?? "—"}
        icon={<PaidIcon />}
        href={`${projectHref}?tab=payments`}
        actionLabel="תשלומים →"
        appearance="dashboard"
        iconAccent="sage"
      />
      <AdminWorkspaceMetricCard
        label="נותר"
        value={payment?.remainingFormatted ?? "—"}
        icon={<RemainingIcon />}
        href={`${projectHref}?tab=payments`}
        actionLabel="תשלומים →"
        appearance="dashboard"
        iconAccent="blush"
      />
      <AdminWorkspaceMetricCard
        label="רווח אדריכל"
        value={totals?.architectProfitTotalFormatted ?? "—"}
        icon={<ProfitIcon />}
        href={`${projectHref}?tab=costs`}
        actionLabel="עלויות →"
        appearance="dashboard"
        iconAccent="gold"
      />
    </section>
  );
}
