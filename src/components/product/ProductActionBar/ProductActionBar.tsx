"use client";

import Image from "next/image";
import Link from "next/link";
import AddToProjectDialog from "@/components/product/AddToProjectDialog/AddToProjectDialog";
import { formatProductSelectionSummary } from "@/lib/products/format-product-selection-summary";
import { hasConfiguratorOptions } from "@/lib/products/product-display-helpers";
import type { ProductAddActionsController } from "@/components/product/useProductAddActions";
import type { ProductConfiguratorState } from "@/lib/products/useProductConfiguratorState";
import type { ProductView } from "@/types/product";
import { MAX_PRODUCT_QUANTITY } from "@/lib/products/useProductConfiguratorState";
import styles from "./ProductActionBar.module.scss";

type ProductActionBarProps = {
  product: ProductView;
  state: ProductConfiguratorState;
  addActions: ProductAddActionsController;
};

function buildSummaryLine(
  product: ProductView,
  state: ProductConfiguratorState,
): string {
  const configurable = hasConfiguratorOptions(product);

  if (!configurable) {
    const parts = [product.nameHe];
    if (product.sku.trim()) {
      parts.push(product.sku.trim());
    }
    return parts.join(" · ");
  }

  const rows = formatProductSelectionSummary({
    material: state.currentMaterial,
    color: state.currentColor,
    sizeLabel: state.currentSize?.label ?? null,
    showSize: state.showSizeSelector,
    quantity: state.quantity,
  });

  return rows.map((row) => row.value).join(" · ");
}

export default function ProductActionBar({
  product,
  state,
  addActions,
}: ProductActionBarProps) {
  const {
    addButtonRef,
    selection,
    configuration,
    quantity,
    decreaseQuantity,
    increaseQuantity,
    isAddDialogOpen,
    isContextPending,
    contextError,
    successMessage,
    successProjectHref,
    showAddSection,
    isApprovedArchitect,
    isClient,
    catalogContext,
    profileReady,
    loginHref,
    registerHref,
    projectOptions,
    handleContextualAdd,
    handleOpenDialog,
    handleDialogClose,
    handleDialogSuccess,
  } = addActions;

  const configurable = hasConfiguratorOptions(product);
  const thumbnailUrl =
    state.selectedImage?.url ?? product.primaryImage?.url ?? null;
  const thumbnailAlt =
    state.selectedImage?.alt ?? product.primaryImage?.alt ?? product.nameHe;
  const summaryLine = buildSummaryLine(product, state);

  if (!showAddSection) {
    return null;
  }

  const renderPrimaryAction = () => {
    if (isClient) {
      return null;
    }

    if (!isApprovedArchitect) {
      if (!loginHref) {
        return null;
      }

      return (
        <Link href={loginHref} className={styles.primaryAction}>
          הוספה לפרויקט
        </Link>
      );
    }

    if (catalogContext) {
      if (!profileReady) {
        return null;
      }

      return (
        <button
          ref={addButtonRef}
          type="button"
          className={styles.primaryAction}
          onClick={handleContextualAdd}
          disabled={isContextPending}
        >
          {isContextPending ? "מוסיף..." : "הוספה לחדר"}
        </button>
      );
    }

    return (
      <button
        ref={addButtonRef}
        type="button"
        className={styles.primaryAction}
        onClick={handleOpenDialog}
      >
        הוספה לפרויקט
      </button>
    );
  };

  return (
    <>
      {catalogContext && isApprovedArchitect ? (
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
      ) : null}

      <div className={styles.bar}>
        <div className={styles.selection}>
          {thumbnailUrl ? (
            <div className={styles.thumbnail}>
              <Image
                src={thumbnailUrl}
                alt=""
                width={48}
                height={48}
                className={styles.thumbnailImage}
                aria-hidden="true"
              />
            </div>
          ) : (
            <div className={styles.thumbnailPlaceholder} aria-hidden="true" />
          )}

          <div className={styles.selectionText}>
            <p className={styles.selectionLabel}>נבחר</p>
            <p className={styles.selectionValue}>{summaryLine}</p>
          </div>
        </div>

        <div className={styles.actions}>
          {!configurable ? (
            <div className={styles.quantity} aria-label="כמות">
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
          ) : null}

          {renderPrimaryAction()}
        </div>
      </div>

      {isClient ? (
        <p className={styles.note}>הוספה לפרויקט זמינה לאדריכלים.</p>
      ) : null}

      {catalogContext && isApprovedArchitect && !profileReady ? (
        <p className={styles.note}>
          יש להשלים פרופיל לפני הוספת מוצרים.{" "}
          <Link href="/professional/profile">השלמת פרופיל</Link>
        </p>
      ) : null}

      {contextError ? (
        <p className={styles.error} role="alert">
          {contextError}
        </p>
      ) : null}

      {successMessage ? (
        <p className={styles.success} role="status">
          {successMessage}{" "}
          {successProjectHref ? (
            <Link href={successProjectHref} className={styles.successLink}>
              צפייה בפרויקט →
            </Link>
          ) : null}
        </p>
      ) : null}

      {!isApprovedArchitect && loginHref && !isClient ? (
        <div className={styles.guestLinks}>
          <Link href={loginHref}>התחברות</Link>
          {registerHref ? (
            <>
              <span aria-hidden="true"> · </span>
              <Link href={registerHref}>הרשמה</Link>
            </>
          ) : null}
        </div>
      ) : null}

      {isApprovedArchitect && !catalogContext ? (
        <AddToProjectDialog
          projectOptions={projectOptions}
          profileReady={profileReady}
          isOpen={isAddDialogOpen}
          onClose={handleDialogClose}
          onSuccess={handleDialogSuccess}
          selection={selection}
          configuration={configuration}
          quantity={quantity}
          decreaseQuantity={decreaseQuantity}
          increaseQuantity={increaseQuantity}
        />
      ) : null}
    </>
  );
}
