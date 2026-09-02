"use client";

import ProductImage from "@/components/product/ProductImage/ProductImage";
import ProductRecolorCanvas from "@/components/product/ProductRecolorCanvas/ProductRecolorCanvas";
import ProductStageImage from "@/components/product/ProductWorkspace/ProductStageImage";
import ProductVisual from "@/components/product/ProductVisual/ProductVisual";
import type { ProductConfiguratorState } from "@/lib/products/useProductConfiguratorState";
import type { ProductView } from "@/types/product";
import styles from "./ProductWorkspacePanels.module.scss";

type ProductWorkspaceProductPanelProps = {
  product: ProductView;
  state: ProductConfiguratorState;
  showThumbnails?: boolean;
};

export default function ProductWorkspaceProductPanel({
  product,
  state,
  showThumbnails = true,
}: ProductWorkspaceProductPanelProps) {
  const {
    productImages,
    selectedImage,
    setSelectedImageUrl,
    showRecolor,
    currentColor,
  } = state;

  const renderProductVisual = () => {
    if (showRecolor && currentColor && product.recolor) {
      return (
        <ProductRecolorCanvas
          sourceImage={product.recolor.sourceImage}
          mask={product.recolor.mask}
          hex={currentColor.hex}
          className={styles.heroRecolor}
          fallback={
            selectedImage ? (
              <ProductStageImage image={selectedImage} priority />
            ) : (
              <ProductVisual tone="gray" variant="hero" />
            )
          }
        />
      );
    }

    if (selectedImage) {
      return <ProductStageImage image={selectedImage} priority />;
    }

    return <ProductVisual tone="gray" variant="hero" />;
  };

  return (
    <div className={styles.panel}>
      <div className={styles.stage}>
        <div className={styles.stageInner}>{renderProductVisual()}</div>
      </div>

      {showRecolor && currentColor ? (
        <p className={styles.recolorHint}>
          <span
            className={styles.recolorSwatch}
            style={{ backgroundColor: currentColor.hex }}
            aria-hidden="true"
          />
          <span>{currentColor.name}</span>
        </p>
      ) : null}

      {productImages.length > 1 ? (
        <div
          className={
            showThumbnails ? styles.thumbnailRow : styles.thumbnailRowHidden
          }
          role="group"
          aria-label="תמונות מוצר"
          aria-hidden={!showThumbnails}
        >
          {productImages.map((image) => (
            <button
              key={image.url}
              type="button"
              className={
                selectedImage?.url === image.url
                  ? styles.thumbnailActive
                  : styles.thumbnailButton
              }
              aria-pressed={selectedImage?.url === image.url}
              aria-label={image.alt}
              onClick={() => setSelectedImageUrl(image.url)}
            >
              <ProductImage
                image={image}
                className={styles.thumbnailImage}
                sizes="80px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
