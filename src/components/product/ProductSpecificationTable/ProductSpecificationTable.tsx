import type { ProductOverviewSpecRow } from "@/lib/products/build-product-overview-spec-rows";
import styles from "./ProductSpecificationTable.module.scss";

type ProductSpecificationTableProps = {
  rows: ProductOverviewSpecRow[];
};

export default function ProductSpecificationTable({
  rows,
}: ProductSpecificationTableProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <dl className={styles.table}>
      {rows.map((row) => (
        <div key={row.label} className={styles.row}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
