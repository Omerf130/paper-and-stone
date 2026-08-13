import { getCatalogResultSummaryLabel } from "@/lib/catalog/get-catalog-result-summary-label";
import styles from "./CatalogResultSummary.module.scss";

type CatalogResultSummaryProps = {
  total: number;
  query: string | null;
  categoryName: string | null;
  hasFilters: boolean;
};

export default function CatalogResultSummary({
  total,
  query,
  categoryName,
  hasFilters,
}: CatalogResultSummaryProps) {
  const label = getCatalogResultSummaryLabel({
    total,
    query,
    categoryName,
    hasFilters,
  });

  return (
    <p className={styles.summary} aria-live="polite">
      {label}
    </p>
  );
}
