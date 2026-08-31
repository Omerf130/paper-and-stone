import styles from "./LayeredPricingTotalsSummary.module.scss";

type LayeredPricingTotalsSummaryProps = {
  label: string;
  idPrefix: string;
  internalCostTotalFormatted?: string;
  commercialMarginTotalFormatted?: string;
  paperStoneProfitTotalFormatted?: string;
  architectProfitTotalFormatted?: string;
  clientSubtotalFormatted?: string;
  vatAmountFormatted?: string;
  clientTotalInclVatFormatted?: string;
  /** @deprecated use clientSubtotalFormatted */
  clientTotalFormatted?: string;
  /** @deprecated use architectProfitTotalFormatted */
  architectTotalFormatted?: string;
  unpricedItemCount?: number;
  needsReviewItemCount?: number;
  /** @deprecated use needsReviewItemCount */
  staleItemCount?: number;
  variant?: "room" | "project";
};

export default function LayeredPricingTotalsSummary({
  label,
  idPrefix,
  internalCostTotalFormatted,
  commercialMarginTotalFormatted,
  paperStoneProfitTotalFormatted,
  architectProfitTotalFormatted,
  clientSubtotalFormatted,
  vatAmountFormatted,
  clientTotalInclVatFormatted,
  clientTotalFormatted,
  architectTotalFormatted,
  unpricedItemCount = 0,
  needsReviewItemCount = 0,
  staleItemCount = 0,
  variant = "room",
}: LayeredPricingTotalsSummaryProps) {
  const resolvedClientSubtotal = clientSubtotalFormatted ?? clientTotalFormatted;
  const resolvedArchitectProfit =
    architectProfitTotalFormatted ?? architectTotalFormatted;
  const resolvedNeedsReview = needsReviewItemCount || staleItemCount;

  const hasAnyTotal =
    internalCostTotalFormatted ||
    commercialMarginTotalFormatted ||
    paperStoneProfitTotalFormatted ||
    resolvedArchitectProfit ||
    resolvedClientSubtotal ||
    vatAmountFormatted ||
    clientTotalInclVatFormatted;

  if (!hasAnyTotal && unpricedItemCount === 0 && resolvedNeedsReview === 0) {
    return null;
  }

  return (
    <dl
      className={`${styles.totals} ${variant === "project" ? styles.project : ""}`}
      aria-labelledby={`${idPrefix}-totals-title`}
    >
      <dt className={styles.srOnly} id={`${idPrefix}-totals-title`}>
        {label}
      </dt>
      <p className={styles.label}>{label}</p>
      {internalCostTotalFormatted ? (
        <div className={styles.row}>
          <dt>סה״כ מחיר מוצר</dt>
          <dd dir="ltr">{internalCostTotalFormatted}</dd>
        </div>
      ) : null}
      {commercialMarginTotalFormatted ? (
        <div className={styles.row}>
          <dt>סה״כ מרווח כולל</dt>
          <dd dir="ltr">{commercialMarginTotalFormatted}</dd>
        </div>
      ) : null}
      {paperStoneProfitTotalFormatted ? (
        <div className={styles.row}>
          <dt>סה״כ רווח Paper & Stone</dt>
          <dd dir="ltr">{paperStoneProfitTotalFormatted}</dd>
        </div>
      ) : null}
      {resolvedArchitectProfit ? (
        <div className={styles.row}>
          <dt>סה״כ רווח אדריכל</dt>
          <dd dir="ltr">{resolvedArchitectProfit}</dd>
        </div>
      ) : null}
      {resolvedClientSubtotal ? (
        <div className={styles.row}>
          <dt>סה״כ לקוח לפני מע״מ</dt>
          <dd dir="ltr">{resolvedClientSubtotal}</dd>
        </div>
      ) : null}
      {vatAmountFormatted ? (
        <div className={styles.row}>
          <dt>מע״מ</dt>
          <dd dir="ltr">{vatAmountFormatted}</dd>
        </div>
      ) : null}
      {clientTotalInclVatFormatted ? (
        <div className={styles.row}>
          <dt>סה״כ לקוח כולל מע״מ</dt>
          <dd dir="ltr">{clientTotalInclVatFormatted}</dd>
        </div>
      ) : null}
      {unpricedItemCount > 0 ? (
        <p className={styles.meta}>{`${unpricedItemCount} מוצרים ללא תמחור מלא`}</p>
      ) : null}
      {resolvedNeedsReview > 0 ? (
        <p className={styles.metaWarning}>{`${resolvedNeedsReview} מוצרים דורשים בדיקת תמחור`}</p>
      ) : null}
    </dl>
  );
}

export { getRoomClientTotalFormatted } from "@/lib/pricing/pricing-room-total-helpers";
export {
  getRoomArchitectProfitTotalFormatted as getRoomArchitectTotalFormattedFromArchitectItems,
} from "@/lib/pricing/pricing-room-total-helpers";
