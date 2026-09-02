"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import AddToProjectDialog from "@/components/product/AddToProjectDialog/AddToProjectDialog";
import ProductOptionGroup from "@/components/product/ProductOptionGroup/ProductOptionGroup";
import { addProductFromCatalogContextAction } from "@/app/professional/projects/actions";
import { buildAddToProjectConfigurationView } from "@/lib/products/build-add-to-project-configuration-view";
import { formatProductSelectionSummary } from "@/lib/products/format-product-selection-summary";
import {
  MAX_PRODUCT_QUANTITY,
  type ProductConfiguratorState,
} from "@/lib/products/useProductConfiguratorState";
import type { ProductView } from "@/types/product";
import type { ProjectPickerOptionView } from "@/types/project";
import type { ArchitectCatalogProjectContextView } from "@/types/architect-catalog-context";
import styles from "./ProductConfiguratorControls.module.scss";

type ProductConfiguratorControlsProps = {
  product: ProductView;
  state: ProductConfiguratorState;
  catalogContext?: ArchitectCatalogProjectContextView | null;
  isApprovedArchitect?: boolean;
  isClient?: boolean;
  projectOptions?: ProjectPickerOptionView[];
  profileReady?: boolean;
  loginHref?: string;
  registerHref?: string;
};

export default function ProductConfiguratorControls({
  product,
  state,
  catalogContext = null,
  isApprovedArchitect = false,
  isClient = false,
  projectOptions = [],
  profileReady = false,
  loginHref,
  registerHref,
}: ProductConfiguratorControlsProps) {
  const [isContextPending, startContextTransition] = useTransition();
  const [contextError, setContextError] = useState<string | undefined>();

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
    selectedImage,
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

  const configuration = useMemo(
    () =>
      buildAddToProjectConfigurationView({
        product,
        material: currentMaterial,
        color: currentColor,
        sizeLabel: currentSize?.label ?? null,
        showSize: showSizeSelector,
        quantity,
        thumbnailUrl: selectedImage?.url ?? product.primaryImage?.url ?? null,
        thumbnailAlt: selectedImage?.alt ?? product.primaryImage?.alt ?? product.nameHe,
      }),
    [
      product,
      currentMaterial,
      currentColor,
      currentSize,
      showSizeSelector,
      quantity,
      selectedImage,
    ],
  );

  const selection = {
    productSlug: product.slug,
    selectedMaterialId: materialId ?? undefined,
    selectedColorId: colorId ?? undefined,
    selectedSizeKey: sizeId ?? undefined,
    quantity,
  };

  const handleContextualAdd = () => {
    if (!catalogContext || !profileReady) {
      return;
    }

    setContextError(undefined);
    startContextTransition(async () => {
      const result = await addProductFromCatalogContextAction({
        projectId: catalogContext.projectId,
        roomId: catalogContext.roomId,
        ...selection,
      });

      if (result?.error) {
        setContextError(result.error);
      }
    });
  };

  const renderAddActions = () => {
    if (isClient) {
      return (
        <p className={styles.clientNote}>
          הוספה לפרויקט זמינה לאדריכלים.
        </p>
      );
    }

    if (!isApprovedArchitect) {
      if (!loginHref) {
        return null;
      }

      return (
        <div className={styles.actions}>
          <Link href={loginHref} className={styles.primaryAction}>
            הוספה לפרויקט
          </Link>
          <div className={styles.guestAuthLinks}>
            <Link href={loginHref}>התחברות</Link>
            {registerHref ? (
              <>
                <span aria-hidden="true"> · </span>
                <Link href={registerHref}>הרשמה</Link>
              </>
            ) : null}
          </div>
        </div>
      );
    }

    if (catalogContext) {
      return (
        <>
          <div className={styles.contextSummary} aria-label="יעד הוספה">
            <p className={styles.contextLine}>
              <span className={styles.contextLabel}>פרויקט:</span>{" "}
              {catalogContext.projectName}
            </p>
            <p className={styles.contextLine}>
              <span className={styles.contextLabel}>חדר:</span>{" "}
              {catalogContext.roomName}
            </p>
          </div>
          {!profileReady ? (
            <p className={styles.profileNote}>
              יש להשלים פרופיל לפני הוספת מוצרים.{" "}
              <Link href="/professional/profile">השלמת פרופיל</Link>
            </p>
          ) : (
            <>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.primaryAction}
                  onClick={handleContextualAdd}
                  disabled={isContextPending}
                >
                  {isContextPending ? "מוסיף..." : "הוספה לחדר"}
                </button>
              </div>
              {contextError ? (
                <p className={styles.error} role="alert">
                  {contextError}
                </p>
              ) : null}
            </>
          )}
        </>
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
        </div>
        <AddToProjectDialog
          projectOptions={projectOptions}
          profileReady={profileReady}
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          selection={selection}
          configuration={configuration}
          quantity={quantity}
          decreaseQuantity={decreaseQuantity}
          increaseQuantity={increaseQuantity}
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
          disabled={quantity >= MAX_PRODUCT_QUANTITY}
        >
          +
        </button>
      </div>
    </fieldset>
  );

  const showAddSection =
    isApprovedArchitect || isClient || Boolean(loginHref);

  if (!initialState.hasConfiguratorOptions) {
    if (!showAddSection) {
      return null;
    }

    return (
      <div className={styles.controls}>
        {renderQuantityField()}
        {renderAddActions()}
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

      {showAddSection ? renderAddActions() : null}
    </div>
  );
}
