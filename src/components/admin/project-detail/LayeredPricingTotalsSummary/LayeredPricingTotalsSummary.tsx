import { formatIlsAgorot } from "@/lib/money/format-ils";
import type { ProjectItemView } from "@/types/project";
import styles from "./LayeredPricingTotalsSummary.module.scss";

type LayeredPricingTotalsSummaryProps = {
  label: string;
  idPrefix: string;
  internalCostTotalFormatted?: string;
  architectTotalFormatted?: string;
  clientTotalFormatted?: string;
  unpricedItemCount?: number;
  staleItemCount?: number;
  variant?: "room" | "project";
};

export default function LayeredPricingTotalsSummary({
  label,
  idPrefix,
  internalCostTotalFormatted,
  architectTotalFormatted,
  clientTotalFormatted,
  unpricedItemCount = 0,
  staleItemCount = 0,
  variant = "room",
}: LayeredPricingTotalsSummaryProps) {
  const hasAnyTotal =
    internalCostTotalFormatted ||
    architectTotalFormatted ||
    clientTotalFormatted;

  if (!hasAnyTotal && unpricedItemCount === 0 && staleItemCount === 0) {
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
          <dt>סה״כ עלות פנימית</dt>
          <dd dir="ltr">{internalCostTotalFormatted}</dd>
        </div>
      ) : null}
      {architectTotalFormatted ? (
        <div className={styles.row}>
          <dt>סה״כ לאדריכל</dt>
          <dd dir="ltr">{architectTotalFormatted}</dd>
        </div>
      ) : null}
      {clientTotalFormatted ? (
        <div className={styles.row}>
          <dt>סה״כ ללקוח</dt>
          <dd dir="ltr">{clientTotalFormatted}</dd>
        </div>
      ) : null}
      {unpricedItemCount > 0 ? (
        <p className={styles.meta}>{`${unpricedItemCount} מוצרים ללא תמחור מלא`}</p>
      ) : null}
      {staleItemCount > 0 ? (
        <p className={styles.metaWarning}>{`${staleItemCount} מוצרים דורשים עדכון מחיר לקוח`}</p>
      ) : null}
    </dl>
  );
}

export function getRoomArchitectTotalFormatted(
  roomItems: ProjectItemView[],
): string | undefined {
  if (
    roomItems.length === 0 ||
    !roomItems.every((item) => item.adminPricing?.architectLineTotalAgorot != null)
  ) {
    return undefined;
  }

  const totalAgorot = roomItems.reduce(
    (sum, item) => sum + (item.adminPricing?.architectLineTotalAgorot ?? 0),
    0,
  );

  return formatIlsAgorot(totalAgorot);
}

export function getRoomArchitectTotalFormattedFromArchitectItems(
  roomItems: ProjectItemView[],
): string | undefined {
  if (
    roomItems.length === 0 ||
    !roomItems.every((item) => item.architectPricing?.architectLineTotalAgorot != null)
  ) {
    return undefined;
  }

  const totalAgorot = roomItems.reduce(
    (sum, item) => sum + (item.architectPricing?.architectLineTotalAgorot ?? 0),
    0,
  );

  return formatIlsAgorot(totalAgorot);
}
