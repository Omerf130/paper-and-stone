"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import AddToProjectDialog from "@/components/product/AddToProjectDialog/AddToProjectDialog";
import { addProductFromCatalogContextAction } from "@/app/professional/projects/actions";
import type { ProductConfiguratorState } from "@/lib/products/useProductConfiguratorState";
import type { ProductView } from "@/types/product";
import type { ProjectOptionView } from "@/types/project";
import type { ArchitectCatalogProjectContextView } from "@/types/architect-catalog-context";
import styles from "./ProductAddActions.module.scss";

type ProductAddActionsProps = {
  product: ProductView;
  state: ProductConfiguratorState;
  catalogContext?: ArchitectCatalogProjectContextView | null;
  isApprovedArchitect?: boolean;
  isClient?: boolean;
  projectOptions?: ProjectOptionView[];
  profileReady?: boolean;
  loginHref?: string;
  registerHref?: string;
};

export default function ProductAddActions({
  product,
  state,
  catalogContext = null,
  isApprovedArchitect = false,
  isClient = false,
  projectOptions = [],
  profileReady = false,
  loginHref,
  registerHref,
}: ProductAddActionsProps) {
  const [isContextPending, startContextTransition] = useTransition();
  const [contextError, setContextError] = useState<string | undefined>();

  const {
    materialId,
    colorId,
    sizeId,
    quantity,
    isAddDialogOpen,
    setIsAddDialogOpen,
  } = state;

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

  if (isClient) {
    return (
      <p className={styles.note}>הוספה לפרויקט זמינה לאדריכלים.</p>
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
          <p className={styles.note}>
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
      />
    </>
  );
}
