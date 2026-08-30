import type { ProductDimensionsView } from "@/types/product";
import styles from "./ProductDimensionsDisplay.module.scss";

type ProductDimensionsDisplayProps = {
  dimensions: ProductDimensionsView;
};

export default function ProductDimensionsDisplay({
  dimensions,
}: ProductDimensionsDisplayProps) {
  return (
    <div className={styles.block}>
      <h3 className={styles.title}>מידות</h3>
      <dl className={styles.list}>
        {dimensions.width !== undefined ? (
          <div className={styles.row}>
            <dt>רוחב</dt>
            <dd>{dimensions.width} ס&quot;מ</dd>
          </div>
        ) : null}
        {dimensions.depth !== undefined ? (
          <div className={styles.row}>
            <dt>עומק</dt>
            <dd>{dimensions.depth} ס&quot;מ</dd>
          </div>
        ) : null}
        {dimensions.height !== undefined ? (
          <div className={styles.row}>
            <dt>גובה</dt>
            <dd>{dimensions.height} ס&quot;מ</dd>
          </div>
        ) : null}
        {dimensions.seatHeight !== undefined ? (
          <div className={styles.row}>
            <dt>גובה מושב</dt>
            <dd>{dimensions.seatHeight} ס&quot;מ</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
