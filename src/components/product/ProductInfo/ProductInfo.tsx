import type { ProductView } from "@/types/product";
import styles from "./ProductInfo.module.scss";

type ProductInfoProps = {
  product: ProductView;
};

export default function ProductInfo({ product }: ProductInfoProps) {
  const hasBrand = product.brand.trim().length > 0;
  const hasDesigner = product.designer.trim().length > 0;

  return (
    <div className={styles.info}>
      {product.category ? (
        <p className={styles.category}>{product.category}</p>
      ) : null}
      <h1 className={styles.name}>{product.nameHe}</h1>
      {product.name ? <p className={styles.nameEn}>{product.name}</p> : null}

      {(hasBrand || hasDesigner) && (
        <dl className={styles.meta}>
          {hasBrand ? (
            <div className={styles.metaRow}>
              <dt>מותג</dt>
              <dd>{product.brand}</dd>
            </div>
          ) : null}
          {hasDesigner ? (
            <div className={styles.metaRow}>
              <dt>מעצב</dt>
              <dd>{product.designer}</dd>
            </div>
          ) : null}
        </dl>
      )}

      {product.shortDescription ? (
        <p className={styles.description}>{product.shortDescription}</p>
      ) : null}
    </div>
  );
}
