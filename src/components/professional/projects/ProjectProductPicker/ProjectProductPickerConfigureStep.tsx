"use client";

import ProductOptionGroup from "@/components/product/ProductOptionGroup/ProductOptionGroup";
import Button from "@/components/ui/Button/Button";
import { formatProductSelectionSummary } from "@/lib/products/format-product-selection-summary";
import {
  MAX_PRODUCT_QUANTITY,
  useProductConfiguratorState,
} from "@/lib/products/useProductConfiguratorState";
import type { ProductView } from "@/types/product";
import configuratorStyles from "@/components/product/ProductConfiguratorControls/ProductConfiguratorControls.module.scss";
import styles from "./ProjectProductPicker.module.scss";

type ProjectProductPickerConfigureStepProps = {
  product: ProductView;
  isPending: boolean;
  error?: string;
  onBack: () => void;
  onAdd: (selection: {
    selectedMaterialId?: string;
    selectedColorId?: string;
    selectedSizeKey?: string;
    quantity: number;
  }) => void;
};

export default function ProjectProductPickerConfigureStep({
  product,
  isPending,
  error,
  onBack,
  onAdd,
}: ProjectProductPickerConfigureStepProps) {
  const state = useProductConfiguratorState(product);
  const {
    initialState,
    showSizeSelector,
    materialId,
    colorId,
    setColorId,
    sizeId,
    setSizeId,
    quantity,
    currentMaterial,
    currentColor,
    currentSize,
    handleMaterialChange,
    decreaseQuantity,
    increaseQuantity,
  } = state;

  const summaryRows = formatProductSelectionSummary({
    material: currentMaterial,
    color: currentColor,
    sizeLabel: currentSize?.label ?? null,
    showSize: showSizeSelector,
    quantity,
  });

  const handleAdd = () => {
    onAdd({
      selectedMaterialId: materialId ?? undefined,
      selectedColorId: colorId ?? undefined,
      selectedSizeKey: sizeId ?? undefined,
      quantity,
    });
  };

  return (
    <div className={configuratorStyles.controls}>
      <p className={styles.configureProductName}>{product.nameHe}</p>

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
        <fieldset className={configuratorStyles.fieldset}>
          <legend className={configuratorStyles.legend}>צבע</legend>
          <div className={configuratorStyles.swatchGroup} role="group" aria-label="צבע">
            {currentMaterial.colors.map((color) => (
              <button
                key={color.id}
                type="button"
                className={
                  colorId === color.id
                    ? configuratorStyles.swatchActive
                    : configuratorStyles.swatch
                }
                aria-pressed={colorId === color.id}
                aria-label={color.name}
                onClick={() => setColorId(color.id)}
              >
                <span
                  className={configuratorStyles.swatchColor}
                  style={{ backgroundColor: color.hex }}
                  aria-hidden="true"
                />
                <span className={configuratorStyles.swatchLabel}>{color.name}</span>
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

      <fieldset className={configuratorStyles.fieldset}>
        <legend className={configuratorStyles.legend}>כמות</legend>
        <div className={configuratorStyles.quantity}>
          <button
            type="button"
            className={configuratorStyles.quantityButton}
            aria-label="הפחתת כמות"
            onClick={decreaseQuantity}
            disabled={quantity <= 1 || isPending}
          >
            −
          </button>
          <span className={configuratorStyles.quantityValue} aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            className={configuratorStyles.quantityButton}
            aria-label="הוספת כמות"
            onClick={increaseQuantity}
            disabled={quantity >= MAX_PRODUCT_QUANTITY || isPending}
          >
            +
          </button>
        </div>
      </fieldset>

      <div className={configuratorStyles.summary}>
        <dl className={configuratorStyles.summaryList}>
          {summaryRows.map((row) => (
            <div key={row.label} className={configuratorStyles.summaryRow}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={configuratorStyles.actions}>
        <Button onClick={handleAdd} loading={isPending} loadingLabel="מוסיף...">
          הוספה לפרויקט
        </Button>
        <Button variant="secondary" onClick={onBack} disabled={isPending}>
          חזרה לרשימה
        </Button>
      </div>
    </div>
  );
}
