import { formatProductSelectionSummary } from "@/lib/products/format-product-selection-summary";
import type { ProductConfiguratorState } from "@/lib/products/useProductConfiguratorState";
import styles from "./ProductSelectionSummary.module.scss";

type ProductSelectionSummaryProps = {
  state: ProductConfiguratorState;
  variant?: "default" | "sidePanel";
};

export default function ProductSelectionSummary({
  state,
  variant = "default",
}: ProductSelectionSummaryProps) {
  const { currentMaterial, currentColor, currentSize, showSizeSelector, quantity } =
    state;

  const rows = formatProductSelectionSummary({
    material: currentMaterial,
    color: currentColor,
    sizeLabel: currentSize?.label ?? null,
    showSize: showSizeSelector,
    quantity,
  });

  if (rows.length === 0) {
    return null;
  }

  return (
    <section
      className={
        variant === "sidePanel" ? styles.summarySidePanel : styles.summary
      }
      aria-label="הבחירה שלך"
    >
      <h2 className={styles.heading}>הבחירה שלך</h2>
      <dl className={styles.rows}>
        {rows.map((row) => (
          <div key={row.label} className={styles.row}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
