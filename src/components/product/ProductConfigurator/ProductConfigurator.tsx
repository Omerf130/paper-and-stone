"use client";

import { useCallback, useMemo, useState } from "react";
import Button from "@/components/Button/Button";
import {
  getColorById,
  getConfiguratorState,
  getFabricById,
  resolveValidColorId,
} from "@/lib/products/configurator-helpers";
import {
  getDefaultVisualTone,
  hasProductDimensions,
} from "@/lib/products/product-display-helpers";
import type { ProductView, VisualTone } from "@/types/product";
import ProductVisual from "../ProductVisual/ProductVisual";
import TechnicalDrawing from "../TechnicalDrawing/TechnicalDrawing";
import styles from "./ProductConfigurator.module.scss";

type ViewMode = "product" | "drawing";

type ProductConfiguratorProps = {
  product: ProductView;
  visualClassName?: string;
  controlsClassName?: string;
};

export default function ProductConfigurator({
  product,
  visualClassName,
  controlsClassName,
}: ProductConfiguratorProps) {
  const initialState = useMemo(
    () => getConfiguratorState(product),
    [product],
  );
  const canShowDrawing = hasProductDimensions(product.dimensions);
  const [view, setView] = useState<ViewMode>("product");
  const [fabricId, setFabricId] = useState<string | null>(initialState.fabricId);
  const [colorId, setColorId] = useState<string | null>(initialState.colorId);
  const [sizeId, setSizeId] = useState<string | null>(initialState.sizeId);
  const [quantity, setQuantity] = useState(1);

  const currentFabric = useMemo(() => {
    if (!fabricId) {
      return null;
    }

    return getFabricById(product, fabricId) ?? null;
  }, [product, fabricId]);

  const currentColor = useMemo(() => {
    if (!currentFabric || !colorId) {
      return null;
    }

    return getColorById(currentFabric, colorId) ?? null;
  }, [currentFabric, colorId]);

  const currentSize = useMemo(() => {
    if (!sizeId) {
      return null;
    }

    return product.sizes.find((size) => size.id === sizeId) ?? null;
  }, [product, sizeId]);

  const visualTone: VisualTone =
    currentColor?.tone ?? getDefaultVisualTone(product);

  const handleFabricChange = useCallback(
    (newFabricId: string) => {
      const fabric = getFabricById(product, newFabricId);
      if (!fabric) {
        return;
      }

      setFabricId(newFabricId);
      setColorId((previousColorId) =>
        previousColorId
          ? resolveValidColorId(fabric, previousColorId)
          : (fabric.colors[0]?.id ?? null),
      );
    },
    [product],
  );

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
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
          <TechnicalDrawing dimensions={product.dimensions} />
        ) : (
          <ProductVisual tone={visualTone} />
        )}
      </div>

      {initialState.hasConfiguratorOptions ? (
        <div className={controlsClasses}>
          {initialState.hasFabrics && currentFabric ? (
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>סוג בד</legend>
              <div className={styles.optionGroup}>
                {product.fabrics.map((fabric) => (
                  <button
                    key={fabric.id}
                    type="button"
                    className={
                      fabricId === fabric.id
                        ? styles.optionActive
                        : styles.optionButton
                    }
                    aria-pressed={fabricId === fabric.id}
                    onClick={() => handleFabricChange(fabric.id)}
                  >
                    {fabric.label}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {currentFabric && currentFabric.colors.length > 0 ? (
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>צבע</legend>
              <div className={styles.swatchGroup}>
                {currentFabric.colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    className={
                      colorId === color.id ? styles.swatchActive : styles.swatch
                    }
                    aria-pressed={colorId === color.id}
                    aria-label={color.label}
                    onClick={() => setColorId(color.id)}
                  >
                    <span
                      className={`${styles.swatchColor} ${styles[`swatchTone${color.tone.charAt(0).toUpperCase()}${color.tone.slice(1)}`]}`}
                      aria-hidden="true"
                    />
                    <span className={styles.swatchLabel}>{color.label}</span>
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
              >
                +
              </button>
            </div>
          </fieldset>

          <div className={styles.summary}>
            <p className={styles.summaryTitle}>הבחירה שלך</p>
            <dl className={styles.summaryList}>
              <div className={styles.summaryRow}>
                <dt>דגם</dt>
                <dd>{product.name}</dd>
              </div>
              {currentFabric ? (
                <div className={styles.summaryRow}>
                  <dt>בד</dt>
                  <dd>{currentFabric.label}</dd>
                </div>
              ) : null}
              {currentColor ? (
                <div className={styles.summaryRow}>
                  <dt>צבע</dt>
                  <dd>{currentColor.label}</dd>
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

          <div className={styles.actions}>
            <button type="button" className={styles.primaryAction} disabled>
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
        </div>
      ) : null}
    </>
  );
}
