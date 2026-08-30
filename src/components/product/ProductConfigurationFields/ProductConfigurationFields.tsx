"use client";

import ProductOptionGroup from "@/components/product/ProductOptionGroup/ProductOptionGroup";
import {
  MAX_PRODUCT_QUANTITY,
  type ProductConfiguratorState,
} from "@/lib/products/useProductConfiguratorState";
import type { ProductView } from "@/types/product";
import styles from "./ProductConfigurationFields.module.scss";

type ProductConfigurationFieldsProps = {
  product: ProductView;
  state: ProductConfiguratorState;
};

export default function ProductConfigurationFields({
  product,
  state,
}: ProductConfigurationFieldsProps) {
  const {
    initialState,
    showSizeSelector,
    materialId,
    colorId,
    setColorId,
    sizeId,
    setSizeId,
    currentMaterial,
    handleMaterialChange,
    decreaseQuantity,
    increaseQuantity,
    quantity,
  } = state;

  if (!initialState.hasConfiguratorOptions) {
    return (
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
  }

  return (
    <div className={styles.fields}>
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
    </div>
  );
}
