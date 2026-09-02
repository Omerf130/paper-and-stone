"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { updateProjectItemAsAdminAction } from "@/app/admin/projects/item-actions";
import AdminProjectItemRowActions from "@/components/admin/project-detail/AdminProjectItemRowActions/AdminProjectItemRowActions";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { getProjectItemConfigurationRows } from "@/lib/projects/project-display-helpers";
import type { ProductThumbnailView } from "@/lib/products/loadProductThumbnailMap";
import type { ProjectItemView } from "@/types/project";
import type { AdminProjectItemPricingView } from "@/types/project-pricing";
import tableStyles from "@/components/admin/project-detail/admin-project-items-table.module.scss";
import styles from "./AdminProjectItemManagementRow.module.scss";

const MAX_QUANTITY = 999;

type AdminProjectItemManagementRowProps = {
  projectId: string;
  item: ProjectItemView;
  thumbnail?: ProductThumbnailView;
  isEditable: boolean;
  showMove?: boolean;
  variant?: "card" | "table";
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
      return { tone: "warning", label: "דורש בדיקה" };
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
  variant = "card",
  onMove,
  onRemove,
}: AdminProjectItemManagementRowProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(item.quantity);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  const configRows = getProjectItemConfigurationRows(item);
  const pricingBadge = getPricingStatusBadge(item.adminPricing);
  const quantityChanged = quantity !== item.quantity;
  const configLines = configRows.slice(0, 2).map((row) => row.value);
  const unitPrice = item.adminPricing?.clientPriceFormatted ?? "—";
  const lineTotal = item.adminPricing?.clientLineTotalFormatted ?? "—";

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

  const productCell = (
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
        <span className={styles.productName}>{item.snapshot.productName}</span>
        <span className={styles.sku} dir="ltr">
          {item.snapshot.sku ?? "—"}
        </span>
      </div>
    </div>
  );

  const quantityCell = isEditable ? (
    <div className={styles.quantityWrap}>
      <input
        id={`qty-${item.id}`}
        type="number"
        min={1}
        max={MAX_QUANTITY}
        className={styles.quantityInput}
        value={quantity}
        onChange={(event) => setQuantity(Number(event.target.value))}
        onBlur={handleSaveQuantity}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        disabled={isPending}
        aria-label="כמות"
        aria-invalid={error ? true : undefined}
      />
      {error ? (
        <p className={styles.quantityError} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  ) : (
    <span className={styles.quantityReadOnly}>×{item.quantity}</span>
  );

  const statusCell = (
    <div className={styles.statusStack}>
      {!item.isProductActive ? (
        <StatusBadge tone="warning">לא פעיל</StatusBadge>
      ) : item.statusPresentation ? (
        <StatusBadge tone={item.statusPresentation.tone}>
          {item.statusPresentation.label}
        </StatusBadge>
      ) : null}
      {pricingBadge ? (
        <span className={styles.pricingHint}>{pricingBadge.label}</span>
      ) : null}
    </div>
  );

  if (variant === "table") {
    return (
      <tr>
        <td>{productCell}</td>
        <td className={tableStyles.detailsCell}>
          {configLines.length > 0 ? configLines.join(" · ") : "—"}
        </td>
        <td className={tableStyles.supplierCell}>{item.supplierName ?? "—"}</td>
        <td className={tableStyles.qtyCell}>{quantityCell}</td>
        <td className={tableStyles.priceCell}>{unitPrice}</td>
        <td className={tableStyles.totalCell}>{lineTotal}</td>
        <td className={tableStyles.statusCell}>{statusCell}</td>
        <td className={tableStyles.actionsCell}>
          {isEditable && (showMove || onRemove) ? (
            <AdminProjectItemRowActions
              showMove={showMove}
              onMove={onMove}
              onRemove={onRemove}
            />
          ) : null}
        </td>
      </tr>
    );
  }

  return (
    <article className={styles.row} aria-labelledby={`admin-item-${item.id}-name`}>
      {productCell}
      <div className={styles.statusStack}>{statusCell}</div>
      <div className={styles.quantityWrap}>{quantityCell}</div>
      {isEditable && (showMove || onRemove) ? (
        <AdminProjectItemRowActions
          showMove={showMove}
          onMove={onMove}
          onRemove={onRemove}
        />
      ) : null}
    </article>
  );
}
