import type { AdminProjectPaymentSummaryView } from "@/types/project-payment";
import styles from "./AdminProjectPaymentSummary.module.scss";

type AdminProjectPaymentSummaryProps = {
  summary: AdminProjectPaymentSummaryView;
};

export default function AdminProjectPaymentSummary({
  summary,
}: AdminProjectPaymentSummaryProps) {
  return (
    <div className={styles.summary}>
      <div className={styles.item}>
        <p className={styles.label}>סה״כ לתשלום</p>
        <p
          className={
            summary.isProjectTotalKnown ? styles.value : styles.valueMuted
          }
        >
          {summary.isProjectTotalKnown
            ? summary.projectTotalInclVatFormatted
            : "לא זמין — תמחור לא שלם"}
        </p>
      </div>

      <div className={styles.item}>
        <p className={styles.label}>שולם</p>
        <p className={styles.value}>{summary.totalPaidFormatted}</p>
      </div>

      <div className={styles.item}>
        <p className={styles.label}>נשאר לתשלום</p>
        <p
          className={
            summary.isProjectTotalKnown ? styles.value : styles.valueMuted
          }
        >
          {summary.isProjectTotalKnown
            ? summary.remainingFormatted
            : "—"}
        </p>
      </div>

      {summary.isOverpaid && summary.overpaidFormatted ? (
        <p className={styles.warning} role="status">
          שולם {summary.overpaidFormatted} מעבר לסכום הפרויקט
        </p>
      ) : null}
    </div>
  );
}
