import ProductDimensionsDisplay from "@/components/product/ProductDimensionsDisplay/ProductDimensionsDisplay";
import ProductImage from "@/components/product/ProductImage/ProductImage";
import TechnicalDrawing from "@/components/product/TechnicalDrawing/TechnicalDrawing";
import { hasProductDimensions } from "@/lib/products/product-display-helpers";
import type { ProductView } from "@/types/product";
import styles from "./ProductWorkspacePanels.module.scss";

type ProductWorkspaceDrawingPanelProps = {
  product: ProductView;
};

export default function ProductWorkspaceDrawingPanel({
  product,
}: ProductWorkspaceDrawingPanelProps) {
  const showDimensions = hasProductDimensions(product.dimensions);
  const hasDrawing = Boolean(product.technicalDrawing);

  if (!hasDrawing && !showDimensions) {
    return (
      <div className={styles.panel}>
        <div className={styles.infoWorkspace}>
          <p className={styles.emptyState}>אין שרטוט או מידות זמינים.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      {hasDrawing ? (
        <div className={styles.stage}>
          <div className={styles.stageInner}>
            <ProductImage
              image={product.technicalDrawing!}
              variant="hero"
              className={styles.uploadedDrawing}
            />
          </div>
        </div>
      ) : (
        <div className={styles.stage}>
          <div className={styles.stageInner}>
            <TechnicalDrawing dimensions={product.dimensions} />
          </div>
        </div>
      )}

      {showDimensions ? (
        <ProductDimensionsDisplay dimensions={product.dimensions} />
      ) : null}
    </div>
  );
}
