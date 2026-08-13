"use client";

import Button from "@/components/Button/Button";
import AddToProjectDialog from "@/components/product/AddToProjectDialog/AddToProjectDialog";
import ProductOptionGroup from "@/components/product/ProductOptionGroup/ProductOptionGroup";
import { formatProductSelectionSummary } from "@/lib/products/format-product-selection-summary";
import {
  MAX_PRODUCT_QUANTITY,
  type ProductConfiguratorState,
} from "@/lib/products/useProductConfiguratorState";
import type { ProductView } from "@/types/product";
import type { ProjectOptionView } from "@/types/project";
import styles from "./ProductConfiguratorControls.module.scss";

type ProductConfiguratorControlsProps = {
  product: ProductView;
  state: ProductConfiguratorState;
  canAddToProject?: boolean;
  projectOptions?: ProjectOptionView[];
  profileReady?: boolean;
};

export default function ProductConfiguratorControls({
  product,
  state,
  canAddToProject = false,
  projectOptions = [],
  profileReady = false,
}: ProductConfiguratorControlsProps) {
  const {
    initialState,
    showSizeSelector,
    materialId,
    colorId,
    setColorId,
    sizeId,
    setSizeId,
    quantity,
    isAddDialogOpen,
    setIsAddDialogOpen,
    currentMaterial,
    currentColor,
    currentSize,
    handleMaterialChange,
    decreaseQuantity,
    increaseQuantity,
  } = state;

  const showAddToProject = canAddToProject;
  const summaryRows = formatProductSelectionSummary({
    material: currentMaterial,
    color: currentColor,
    sizeLabel: currentSize?.label ?? null,
    showSize: showSizeSelector,
    quantity,
  });

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
          disabled={quantity >= MAX_PRODUCT_QUANTITY}
        >
          +
        </button>
      </div>
    </fieldset>
  );

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

  if (!initialState.hasConfiguratorOptions) {
    if (!showAddToProject) {
      return null;
    }

    return (
      <div className={styles.controls}>
        {renderQuantityField()}
        {renderAddToProjectActions()}
      </div>
    );
  }

  return (
    <div className={styles.controls}>
      {initialState.hasMaterials && currentMaterial ? (
        <ProductOptionGroup
          legend="חומר"
          options={product.materialOptions.map((material) => ({
            id: material.materialId,
            label: material.materialName,
          }))}
          selectedId={materialId}
          onSelect={handleMaterialChange}
        />
      ) : null}

      {currentMaterial && currentMaterial.colors.length > 0 ? (
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>צבע</legend>
          <div className={styles.swatchGroup} role="group" aria-label="צבע">
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

      {initialState.hasSizes && showSizeSelector ? (
        <ProductOptionGroup
          legend="מידה"
          options={product.sizes.map((size) => ({
            id: size.id,
            label: size.label,
          }))}
          selectedId={sizeId}
          onSelect={setSizeId}
        />
      ) : null}

      {renderQuantityField()}

      <div className={styles.summary}>
        <dl className={styles.summaryList}>
          {summaryRows.map((row) => (
            <div key={row.label} className={styles.summaryRow}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {renderAddToProjectActions()}
    </div>
  );
}
