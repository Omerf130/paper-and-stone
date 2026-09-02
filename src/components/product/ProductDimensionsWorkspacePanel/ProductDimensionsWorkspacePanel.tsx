import ProductImage from "@/components/product/ProductImage/ProductImage";
import TechnicalDrawing from "@/components/product/TechnicalDrawing/TechnicalDrawing";
import { hasProductDimensions } from "@/lib/products/product-display-helpers";
import type { ProductView } from "@/types/product";
import panelStyles from "@/components/product/ProductWorkspace/ProductWorkspacePanels.module.scss";
import styles from "./ProductDimensionsWorkspacePanel.module.scss";

type ProductDimensionsWorkspacePanelProps = {
  product: ProductView;
};

function renderTechnicalDrawing(product: ProductView, hasUploadedDrawing: boolean) {
  if (hasUploadedDrawing) {
    return (
      <div className={panelStyles.stage}>
        <div className={panelStyles.stageInner}>
          <ProductImage
            image={product.technicalDrawing!}
            variant="hero"
            className={panelStyles.uploadedDrawing}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={panelStyles.stage}>
      <div className={panelStyles.stageInner}>
        <TechnicalDrawing dimensions={product.dimensions} />
      </div>
    </div>
  );
}

export default function ProductDimensionsWorkspacePanel({
  product,
}: ProductDimensionsWorkspacePanelProps) {
  const showDimensions = hasProductDimensions(product.dimensions);
  const hasUploadedDrawing = Boolean(product.technicalDrawing);
  const showDrawing = hasUploadedDrawing || showDimensions;

  if (!showDrawing && !showDimensions) {
    return <p className={styles.emptyState}>אין שרטוט או מידות זמינים.</p>;
  }

  return (
    <div className={styles.workspace}>
      {showDimensions ? (
        <div className={styles.specColumn}>
          <dl className={styles.specList}>
            {product.dimensions.width !== undefined ? (
              <div className={styles.specRow}>
                <dt>רוחב</dt>
                <dd>{product.dimensions.width} ס&quot;מ</dd>
              </div>
            ) : null}
            {product.dimensions.depth !== undefined ? (
              <div className={styles.specRow}>
                <dt>עומק</dt>
                <dd>{product.dimensions.depth} ס&quot;מ</dd>
              </div>
            ) : null}
            {product.dimensions.height !== undefined ? (
              <div className={styles.specRow}>
                <dt>גובה</dt>
                <dd>{product.dimensions.height} ס&quot;מ</dd>
              </div>
            ) : null}
            {product.dimensions.seatHeight !== undefined ? (
              <div className={styles.specRow}>
                <dt>גובה מושב</dt>
                <dd>{product.dimensions.seatHeight} ס&quot;מ</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}

      {showDrawing ? (
        <div className={styles.drawingColumn}>
          {renderTechnicalDrawing(product, hasUploadedDrawing)}
        </div>
      ) : null}
    </div>
  );
}
