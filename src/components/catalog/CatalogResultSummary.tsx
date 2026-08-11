import styles from "./CatalogResultSummary.module.scss";

type CatalogResultSummaryProps = {
  total: number;
  hasFilters: boolean;
};

export default function CatalogResultSummary({
  total,
  hasFilters,
}: CatalogResultSummaryProps) {
  const label = hasFilters
    ? `${total} תוצאות`
    : `${total} מוצרים`;

  return (
    <p className={styles.summary} aria-live="polite">
      {label}
    </p>
  );
}
