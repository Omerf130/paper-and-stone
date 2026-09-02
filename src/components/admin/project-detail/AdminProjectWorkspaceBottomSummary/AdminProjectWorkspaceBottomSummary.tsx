import type { AdminProjectDetailWithThumbnails } from "@/lib/projects/getAdminProjects";
import styles from "./AdminProjectWorkspaceBottomSummary.module.scss";

type AdminProjectWorkspaceBottomSummaryProps = {
  project: AdminProjectDetailWithThumbnails;
};

export default function AdminProjectWorkspaceBottomSummary({
  project,
}: AdminProjectWorkspaceBottomSummaryProps) {
  const totals = project.pricingTotals;
  const payment = project.paymentSummary;

  const segments = [
    { label: "סה״כ לקוח", value: totals?.clientTotalInclVatFormatted ?? "—" },
    { label: "רווח אדריכל", value: totals?.architectProfitTotalFormatted ?? "—" },
    { label: "רווח P&S", value: totals?.paperStoneProfitTotalFormatted ?? "—" },
    { label: "שולם", value: payment?.totalPaidFormatted ?? "—" },
    { label: "נותר", value: payment?.remainingFormatted ?? "—" },
  ];

  return (
    <div className={styles.strip} aria-label="סיכום כספי פרויקט">
      {segments.map((segment, index) => (
        <div key={segment.label} className={styles.segmentWrap}>
          {index > 0 ? <span className={styles.separator} aria-hidden="true" /> : null}
          <div className={styles.segment}>
            <span className={styles.label}>{segment.label}</span>
            <span className={styles.value}>{segment.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
