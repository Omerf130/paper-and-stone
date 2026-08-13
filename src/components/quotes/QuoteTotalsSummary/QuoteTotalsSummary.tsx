import type { QuoteTotalsView } from "@/types/project-quote";
import styles from "./QuoteTotalsSummary.module.scss";

type QuoteTotalsSummaryProps = {
  totals: QuoteTotalsView;
  idPrefix?: string;
};

export default function QuoteTotalsSummary({
  totals,
  idPrefix = "quote-totals",
}: QuoteTotalsSummaryProps) {
  const vatPercent = totals.vatRateBasisPoints / 100;

  return (
    <dl className={styles.totals} aria-labelledby={`${idPrefix}-title`}>
      <dt className={styles.srOnly} id={`${idPrefix}-title`}>
        סיכום הצעת מחיר
      </dt>
      <div className={styles.row}>
        <dt>סכום ביניים (לפני מע״מ)</dt>
        <dd>{totals.subtotalFormatted}</dd>
      </div>
      {totals.adjustmentsAgorot !== 0 ? (
        <div className={styles.row}>
          <dt>תוספות / הנחות</dt>
          <dd>{totals.adjustmentsFormatted}</dd>
        </div>
      ) : null}
      <div className={styles.row}>
        <dt>בסיס חייב במע״מ</dt>
        <dd>{totals.taxableBaseFormatted}</dd>
      </div>
      <div className={styles.row}>
        <dt>{`מע״מ (${vatPercent}%)`}</dt>
        <dd>{totals.taxAmountFormatted}</dd>
      </div>
      <div className={`${styles.row} ${styles.grandTotal}`}>
        <dt>סה״כ לתשלום</dt>
        <dd>{totals.totalFormatted}</dd>
      </div>
    </dl>
  );
}
