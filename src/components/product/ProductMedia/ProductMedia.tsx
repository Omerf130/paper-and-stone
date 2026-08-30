"use client";

import ProductImage from "@/components/product/ProductImage/ProductImage";
import ProductRecolorCanvas from "@/components/product/ProductRecolorCanvas/ProductRecolorCanvas";
import ProductVisual from "@/components/product/ProductVisual/ProductVisual";
import TechnicalDrawing from "@/components/product/TechnicalDrawing/TechnicalDrawing";
import type { ProductConfiguratorState } from "@/lib/products/useProductConfiguratorState";
import type { ProductView } from "@/types/product";
import styles from "./ProductMedia.module.scss";

type ProductMediaProps = {
  product: ProductView;
  state: ProductConfiguratorState;
};

export default function ProductMedia({ product, state }: ProductMediaProps) {
  const {
    canShowDrawing,
    productImages,
    view,
    setView,
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
          fallback={
            selectedImage ? (
              <ProductImage image={selectedImage} priority />
            ) : (
              <ProductVisual tone="gray" />
            )
          }
        />
      );
    }

    if (selectedImage) {
      return <ProductImage image={selectedImage} priority />;
    }

    return <ProductVisual tone="gray" />;
  };

  return (
    <div className={styles.media}>
      {canShowDrawing ? (
        <div className={styles.viewSwitch} role="group" aria-label="תצוגת מוצר">
          <button
            type="button"
            className={view === "product" ? styles.viewActive : styles.viewButton}
            aria-pressed={view === "product"}
            onClick={() => setView("product")}
          >
            מוצר
          </button>
          <button
            type="button"
            className={view === "drawing" ? styles.viewActive : styles.viewButton}
            aria-pressed={view === "drawing"}
            onClick={() => setView("drawing")}
          >
            שרטוט ומידות
          </button>
        </div>
      ) : null}

      <div className={styles.stage}>
        <div className={styles.stageInner}>
          {view === "drawing" && canShowDrawing ? (
            product.technicalDrawing ? (
              <ProductImage
                image={product.technicalDrawing}
                className={styles.uploadedDrawing}
              />
            ) : (
              <TechnicalDrawing dimensions={product.dimensions} />
            )
          ) : (
            <>
              {renderProductVisual()}
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
            </>
          )}
        </div>
      </div>

      {view === "product" && productImages.length > 1 ? (
        <div
          className={styles.thumbnailRow}
          role="group"
          aria-label="תמונות מוצר"
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
