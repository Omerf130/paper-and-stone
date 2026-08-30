import type { ProductView } from "@/types/product";
import styles from "./ProductWorkspacePanels.module.scss";

type ProductWorkspaceDetailsPanelProps = {
  product: ProductView;
};

function hasReadOnlyAttributes(product: ProductView): boolean {
  return (
    product.category.trim().length > 0 ||
    product.brand.trim().length > 0 ||
    product.designer.trim().length > 0 ||
    product.name.trim().length > 0
  );
}

export default function ProductWorkspaceDetailsPanel({
  product,
}: ProductWorkspaceDetailsPanelProps) {
  const hasDescription = product.longDescription.trim().length > 0;
  const hasAttributes = hasReadOnlyAttributes(product);

  if (!hasDescription && !hasAttributes) {
    return (
      <div className={styles.infoWorkspace}>
        <p className={styles.emptyState}>אין פרטי מוצר נוספים זמינים.</p>
      </div>
    );
  }

  return (
    <div className={styles.infoWorkspace}>
      <div className={styles.detailsLayout}>
        {hasDescription ? (
          <div className={styles.detailsPrimary}>
            <h3 className={styles.infoHeading}>פרטי מוצר</h3>
            <p className={styles.detailsDescription}>{product.longDescription}</p>
          </div>
        ) : null}

        {hasAttributes ? (
          <div className={styles.detailsAside}>
            <h4 className={styles.infoSubheading}>מאפיינים</h4>
            <dl className={styles.attributeList}>
              {product.category.trim().length > 0 ? (
                <div className={styles.attributeRow}>
                  <dt>קטגוריה</dt>
                  <dd>{product.category}</dd>
                </div>
              ) : null}
              {product.brand.trim().length > 0 ? (
                <div className={styles.attributeRow}>
                  <dt>מותג</dt>
                  <dd>{product.brand}</dd>
                </div>
              ) : null}
              {product.designer.trim().length > 0 ? (
                <div className={styles.attributeRow}>
                  <dt>מעצב</dt>
                  <dd>{product.designer}</dd>
                </div>
              ) : null}
              {product.name.trim().length > 0 &&
              product.name !== product.nameHe ? (
                <div className={styles.attributeRow}>
                  <dt>שם באנגלית</dt>
                  <dd>{product.name}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}
      </div>
    </div>
  );
}
