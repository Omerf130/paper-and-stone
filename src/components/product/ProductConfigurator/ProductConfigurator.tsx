"use client";

import { useCallback, useMemo, useState } from "react";
import Button from "@/components/Button/Button";
import AddToProjectDialog from "@/components/product/AddToProjectDialog/AddToProjectDialog";
import {
  getColorById,
  getConfiguratorState,
  getMaterialById,
  resolveValidColorId,
} from "@/lib/products/configurator-helpers";
import { hasProductDimensions } from "@/lib/products/product-display-helpers";
import { shouldShowRecolorForImage } from "@/lib/recolor/recolor-configurator-helpers";
import type { PublicImageView } from "@/types/product-media";
import type { ProductView } from "@/types/product";
import type { ProjectOptionView } from "@/types/project";
import ProductImage from "../ProductImage/ProductImage";
import ProductRecolorCanvas from "../ProductRecolorCanvas/ProductRecolorCanvas";
import ProductVisual from "../ProductVisual/ProductVisual";
import TechnicalDrawing from "../TechnicalDrawing/TechnicalDrawing";
import styles from "./ProductConfigurator.module.scss";

type ViewMode = "product" | "drawing";

function buildProductImages(product: ProductView): PublicImageView[] {
  const images: PublicImageView[] = [];

  if (product.primaryImage) {
    images.push(product.primaryImage);
  }

  for (const image of product.gallery) {
    if (!images.some((existing) => existing.url === image.url)) {
      images.push(image);
    }
  }

  return images;
}

type ProductConfiguratorProps = {
  product: ProductView;
  visualClassName?: string;
  controlsClassName?: string;
  canAddToProject?: boolean;
  projectOptions?: ProjectOptionView[];
  profileReady?: boolean;
};

const MAX_QUANTITY = 999;

export default function ProductConfigurator({
  product,
  visualClassName,
  controlsClassName,
  canAddToProject = false,
  projectOptions = [],
  profileReady = false,
}: ProductConfiguratorProps) {
  const initialState = useMemo(
    () => getConfiguratorState(product),
    [product],
  );
  const canShowDrawing =
    Boolean(product.technicalDrawing) || hasProductDimensions(product.dimensions);
  const productImages = useMemo(() => buildProductImages(product), [product]);
  const [view, setView] = useState<ViewMode>("product");
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
    product.primaryImage?.url ?? productImages[0]?.url ?? null,
  );
  const [materialId, setMaterialId] = useState<string | null>(
    initialState.materialId,
  );
  const [colorId, setColorId] = useState<string | null>(initialState.colorId);
  const [sizeId, setSizeId] = useState<string | null>(initialState.sizeId);
  const [quantity, setQuantity] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const showAddToProject = canAddToProject;

  const currentMaterial = useMemo(() => {
    if (!materialId) {
      return null;
    }

    return getMaterialById(product, materialId) ?? null;
  }, [product, materialId]);

  const currentColor = useMemo(() => {
    if (!currentMaterial || !colorId) {
      return null;
    }

    return getColorById(currentMaterial, colorId) ?? null;
  }, [currentMaterial, colorId]);

  const currentSize = useMemo(() => {
    if (!sizeId) {
      return null;
    }

    return product.sizes.find((size) => size.id === sizeId) ?? null;
  }, [product, sizeId]);

  const selectedImage = useMemo(() => {
    if (!selectedImageUrl) {
      return product.primaryImage;
    }

    return (
      productImages.find((image) => image.url === selectedImageUrl) ??
      product.primaryImage
    );
  }, [product.primaryImage, productImages, selectedImageUrl]);

  const handleMaterialChange = useCallback(
    (newMaterialId: string) => {
      const material = getMaterialById(product, newMaterialId);
      if (!material) {
        return;
      }

      setMaterialId(newMaterialId);
      setColorId((previousColorId) =>
        previousColorId
          ? resolveValidColorId(material, previousColorId)
          : (material.colors[0]?.id ?? null),
      );
    },
    [product],
  );

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(MAX_QUANTITY, prev + 1));
  };

  const renderAddToProjectActions = () => {
    if (!showAddToProject) {
      return (
        <div className={styles.secondaryActions}>
          <Button preview variant="secondary">
            שמירה למועדפים
          </Button>
          <Button preview variant="text">
            הורדת מפרט טכני
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryAction}
            onClick={() => setIsAddDialogOpen(true)}
          >
            הוספה לפרויקט
          </button>
          <div className={styles.secondaryActions}>
            <Button preview variant="secondary">
              שמירה למועדפים
            </Button>
            <Button preview variant="text">
              הורדת מפרט טכני
            </Button>
          </div>
        </div>
        <AddToProjectDialog
          projectOptions={projectOptions}
          profileReady={profileReady}
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          selection={{
            productSlug: product.slug,
            selectedMaterialId: materialId ?? undefined,
            selectedColorId: colorId ?? undefined,
            selectedSizeKey: sizeId ?? undefined,
            quantity,
          }}
        />
      </>
    );
  };

  const renderQuantityField = () => (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>כמות</legend>
      <div className={styles.quantity}>
        <button
          type="button"
          className={styles.quantityButton}
          aria-label="הפחתת כמות"
          onClick={decreaseQuantity}
          disabled={quantity <= 1}
        >
          −
        </button>
        <span className={styles.quantityValue} aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          className={styles.quantityButton}
          aria-label="הוספת כמות"
          onClick={increaseQuantity}
          disabled={quantity >= MAX_QUANTITY}
        >
          +
        </button>
      </div>
    </fieldset>
  );

  const showRecolor = shouldShowRecolorForImage(
    product,
    selectedImageUrl,
    currentColor?.hex,
  );

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

  const visualClasses = visualClassName
    ? `${styles.visualSection} ${visualClassName}`
    : styles.visualSection;

  const controlsClasses = controlsClassName
    ? `${styles.controlsSection} ${controlsClassName}`
    : styles.controlsSection;

  return (
    <>
      <div className={visualClasses}>
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
          renderProductVisual()
        )}

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

      {initialState.hasConfiguratorOptions ? (
        <div className={controlsClasses}>
          {initialState.hasMaterials && currentMaterial ? (
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>חומר</legend>
              <div className={styles.optionGroup}>
                {product.materialOptions.map((material) => (
                  <button
                    key={material.materialId}
                    type="button"
                    className={
                      materialId === material.materialId
                        ? styles.optionActive
                        : styles.optionButton
                    }
                    aria-pressed={materialId === material.materialId}
                    onClick={() => handleMaterialChange(material.materialId)}
                  >
                    {material.materialName}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {currentMaterial && currentMaterial.colors.length > 0 ? (
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>צבע</legend>
              <div className={styles.swatchGroup}>
                {currentMaterial.colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    className={
                      colorId === color.id ? styles.swatchActive : styles.swatch
                    }
                    aria-pressed={colorId === color.id}
                    aria-label={color.name}
                    onClick={() => setColorId(color.id)}
                  >
                    <span
                      className={styles.swatchColor}
                      style={{ backgroundColor: color.hex }}
                      aria-hidden="true"
                    />
                    <span className={styles.swatchLabel}>{color.name}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {initialState.hasSizes ? (
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>מידה</legend>
              <div className={styles.optionGroup}>
                {product.sizes.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    className={
                      sizeId === size.id ? styles.optionActive : styles.optionButton
                    }
                    aria-pressed={sizeId === size.id}
                    onClick={() => setSizeId(size.id)}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {renderQuantityField()}

          <div className={styles.summary}>
            <p className={styles.summaryTitle}>הבחירה שלך</p>
            <dl className={styles.summaryList}>
              <div className={styles.summaryRow}>
                <dt>דגם</dt>
                <dd>{product.name}</dd>
              </div>
              {currentMaterial ? (
                <div className={styles.summaryRow}>
                  <dt>חומר</dt>
                  <dd>{currentMaterial.materialName}</dd>
                </div>
              ) : null}
              {currentColor ? (
                <div className={styles.summaryRow}>
                  <dt>צבע</dt>
                  <dd>{currentColor.name}</dd>
                </div>
              ) : null}
              {currentSize ? (
                <div className={styles.summaryRow}>
                  <dt>מידה</dt>
                  <dd>{currentSize.label}</dd>
                </div>
              ) : null}
              <div className={styles.summaryRow}>
                <dt>כמות</dt>
                <dd>{quantity}</dd>
              </div>
            </dl>
          </div>

          {renderAddToProjectActions()}
        </div>
      ) : showAddToProject ? (
        <div className={controlsClasses}>
          {renderQuantityField()}
          {renderAddToProjectActions()}
        </div>
      ) : null}
    </>
  );
}
