"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateProjectItemAsAdminAction } from "@/app/admin/projects/item-actions";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import Button from "@/components/ui/Button/Button";
import { formFieldStyles } from "@/components/ui/FormField/FormField";
import { getProjectItemConfigurationRows } from "@/lib/projects/project-display-helpers";
import type { ProductThumbnailView } from "@/lib/products/loadProductThumbnailMap";
import type { ProjectItemView } from "@/types/project";
import type { AdminProjectItemPricingView } from "@/types/project-pricing";
import styles from "./AdminProjectItemManagementRow.module.scss";

const MAX_QUANTITY = 999;

type AdminProjectItemManagementRowProps = {
  projectId: string;
  item: ProjectItemView;
  thumbnail?: ProductThumbnailView;
  isEditable: boolean;
  showMove?: boolean;
  onMove?: () => void;
  onRemove?: () => void;
};

function getPricingStatusBadge(
  pricing?: AdminProjectItemPricingView,
): { tone: "neutral" | "warning" | "positive"; label: string } | null {
  if (!pricing) {
    return null;
  }

  switch (pricing.pricingStatus) {
    case "unpriced":
      return { tone: "warning", label: "ללא תמחור" };
    case "needs_review":
      return { tone: "warning", label: "דורש בדיקת תמחור" };
    case "priced":
      return { tone: "positive", label: "מתומחר" };
    default:
      return null;
  }
}

export default function AdminProjectItemManagementRow({
  projectId,
  item,
  thumbnail,
  isEditable,
  showMove = false,
  onMove,
  onRemove,
}: AdminProjectItemManagementRowProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(item.quantity);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const configRows = getProjectItemConfigurationRows(item);
  const pricingBadge = getPricingStatusBadge(item.adminPricing);
  const quantityChanged = quantity !== item.quantity;
  const configSummary = configRows.map((row) => row.value).join(" · ");

  const handleSaveQuantity = () => {
    if (!quantityChanged) {
      return;
    }

    setError(undefined);

    startTransition(async () => {
      const result = await updateProjectItemAsAdminAction({
        projectId,
        itemId: item.id,
        quantity,
        selectedMaterialId: item.selectedMaterialId ?? undefined,
        selectedColorId: item.selectedColorId ?? undefined,
        selectedSizeKey: item.selectedSizeKey ?? undefined,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  };

  return (
    <article className={styles.row} aria-labelledby={`admin-item-${item.id}-name`}>
      <div className={styles.identity}>
        <div className={styles.imageWrap}>
          {thumbnail?.url ? (
            // eslint-disable-next-line @next/next/no-img-element -- product thumbnail from known media URLs
            <img
              src={thumbnail.url}
              alt={thumbnail.altText || item.snapshot.productName}
              width={40}
              height={40}
              className={styles.image}
            />
          ) : (
            <div className={styles.imagePlaceholder} aria-hidden="true" />
          )}
        </div>
        <div className={styles.identityText}>
          <h4 id={`admin-item-${item.id}-name`} className={styles.productName}>
            {item.snapshot.productName}
          </h4>
          <p className={styles.sku} dir="ltr">
            {item.snapshot.sku ?? "—"}
            {configSummary ? ` · ${configSummary}` : ""}
          </p>
        </div>
      </div>

      <div className={styles.badges}>
        {!item.isProductActive ? (
          <StatusBadge tone="warning">לא פעיל</StatusBadge>
        ) : null}
        {item.statusPresentation ? (
          <StatusBadge tone={item.statusPresentation.tone}>
            {item.statusPresentation.label}
          </StatusBadge>
        ) : null}
        {pricingBadge ? (
          <StatusBadge tone={pricingBadge.tone}>{pricingBadge.label}</StatusBadge>
        ) : null}
      </div>

      <div className={styles.quantityWrap}>
        {isEditable ? (
          <>
            <div className={styles.quantityControls}>
              <input
                id={`qty-${item.id}`}
                type="number"
                min={1}
                max={MAX_QUANTITY}
                className={`${formFieldStyles.input} ${styles.quantityInput}`}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                disabled={isPending}
                aria-label="כמות"
                aria-invalid={error ? true : undefined}
              />
              {quantityChanged ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleSaveQuantity}
                  loading={isPending}
                  loadingLabel="שומר..."
                >
                  שמירה
                </Button>
              ) : null}
            </div>
            {error ? (
              <p className={styles.quantityError} role="alert">
                {error}
              </p>
            ) : null}
          </>
        ) : (
          <p className={styles.quantityReadOnly}>×{item.quantity}</p>
        )}
      </div>

      {isEditable && (showMove || onRemove) ? (
        <div className={styles.actions}>
          {showMove && onMove ? (
            <Button variant="ghost" size="sm" onClick={onMove}>
              העברה
            </Button>
          ) : null}
          {onRemove ? (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              הסרה
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
