"use client";

import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { getProjectItemConfigurationRows } from "@/lib/projects/project-display-helpers";
import ArchitectProjectItemStatusControl from "@/components/professional/projects/ArchitectProjectItemStatusControl/ArchitectProjectItemStatusControl";
import ProjectItemStatusHistoryPanel from "@/components/shared/ProjectItemStatusHistory/ProjectItemStatusHistoryPanel";
import { getProjectItemStatusWorkflowContext } from "@/lib/project-items/project-item-status-presentation";
import ProjectItemEditor from "@/components/professional/projects/ProjectItemEditor/ProjectItemEditor";
import Button from "@/components/ui/Button/Button";
import type { ProductThumbnailView } from "@/lib/products/loadProductThumbnailMap";
import type { ProjectItemView } from "@/types/project";
import type { ArchitectProjectItemPricingView } from "@/types/project-pricing";
import type { ProductView } from "@/types/product";
import { useState } from "react";
import styles from "./ArchitectProjectItemCard.module.scss";

type ArchitectProjectItemCardProps = {
  projectId: string;
  item: ProjectItemView;
  pricing: ArchitectProjectItemPricingView;
  thumbnail?: ProductThumbnailView;
  productView?: ProductView;
  isEditable: boolean;
  showMove?: boolean;
  onMove?: () => void;
  onRemove?: () => void;
};

function getPricingStatusMessage(
  pricingStatus: ArchitectProjectItemPricingView["pricingStatus"],
): string {
  switch (pricingStatus) {
    case "unpriced":
      return "ממתין לתמחור מנהל";
    case "needs_review":
      return "התמחור דורש בדיקת מנהל";
    case "priced":
      return "";
  }
}

export default function ArchitectProjectItemCard({
  projectId,
  item,
  pricing,
  thumbnail,
  productView,
  isEditable,
  showMove = false,
  onMove,
  onRemove,
}: ArchitectProjectItemCardProps) {
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const configRows = getProjectItemConfigurationRows(item);
  const sku = item.snapshot.sku ?? "—";
  const pricingStatusMessage = getPricingStatusMessage(pricing.pricingStatus);

  return (
    <article className={styles.card} aria-labelledby={`arch-item-${item.id}-name`}>
      <header className={styles.cardHeader} data-layer="header">
        <div className={styles.identity} data-section="product">
          <div className={styles.imageWrap}>
            {thumbnail?.url ? (
              // eslint-disable-next-line @next/next/no-img-element -- product thumbnail from known media URLs
              <img
                src={thumbnail.url}
                alt={thumbnail.altText || item.snapshot.productName}
                width={56}
                height={56}
                className={styles.image}
              />
            ) : (
              <div className={styles.imagePlaceholder} aria-hidden="true" />
            )}
          </div>
          <div className={styles.identityText}>
            <h4 id={`arch-item-${item.id}-name`} className={styles.productName}>
              {item.snapshot.productName}
            </h4>
            <p className={styles.productCode} dir="ltr">
              {sku}
            </p>
            {configRows.length > 0 ? (
              <dl className={styles.configList}>
                {configRows.map((row) => (
                  <div key={row.label} className={styles.configItem}>
                    <dt>{row.label}</dt>
                    <dd dir={row.dir}>{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <p className={styles.quantity}>כמות: {item.quantity}</p>
            {!item.isProductActive ? (
              <StatusBadge tone="warning">המוצר אינו פעיל</StatusBadge>
            ) : null}
          </div>
        </div>

        {item.status ? (
          <div className={styles.workflowState} data-section="workflow">
            <ArchitectProjectItemStatusControl
              projectId={projectId}
              projectItemId={item.id}
              status={item.status}
              allowedTargetStatuses={item.allowedTargetStatuses ?? []}
              presentation={item.statusPresentation}
              isEditable={isEditable}
            />
            {getProjectItemStatusWorkflowContext(item.status, "architect") ? (
              <p
                className={
                  item.status === "client_rejected"
                    ? styles.workflowContextAttention
                    : styles.workflowContext
                }
              >
                {getProjectItemStatusWorkflowContext(item.status, "architect")}
              </p>
            ) : null}
            {item.statusHistory && item.statusHistory.length > 0 ? (
              <ProjectItemStatusHistoryPanel
                history={item.statusHistory}
                role="architect"
              />
            ) : null}
          </div>
        ) : null}
      </header>

      <hr className={styles.cardDivider} />

      <div className={styles.pricingSection}>
        {pricing.pricingStatus !== "priced" ? (
          <p className={styles.waiting} role="status">
            {pricingStatusMessage}
          </p>
        ) : (
          <>
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>מחיר ללקוח (יחידה)</span>
              <span className={styles.priceValue} dir="ltr">
                {pricing.clientPriceFormatted}
              </span>
            </div>
            {item.quantity > 1 && pricing.clientLineTotalFormatted ? (
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>סה״כ שורה ללקוח</span>
                <span className={styles.priceValue} dir="ltr">
                  {pricing.clientLineTotalFormatted}
                </span>
              </div>
            ) : null}
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>רווח אדריכל (יחידה)</span>
              <span className={styles.priceValue} dir="ltr">
                {pricing.architectProfitFormatted}
              </span>
            </div>
            {item.quantity > 1 && pricing.architectProfitLineTotalFormatted ? (
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>סה״כ רווח אדריכל</span>
                <span className={styles.priceValue} dir="ltr">
                  {pricing.architectProfitLineTotalFormatted}
                </span>
              </div>
            ) : null}
          </>
        )}
      </div>

      {isEditable ? (
        <div className={styles.itemActions}>
          {showMove && onMove ? (
            <Button variant="ghost" size="sm" onClick={onMove}>
              העברת חדר
            </Button>
          ) : null}
          {productView ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingConfig((current) => !current)}
            >
              {isEditingConfig ? "סגירת עריכה" : "עריכת תצורה"}
            </Button>
          ) : null}
          {onRemove ? (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              הסרה
            </Button>
          ) : null}
        </div>
      ) : null}

      {isEditingConfig && productView ? (
        <ProjectItemEditor
          projectId={projectId}
          item={item}
          product={productView}
          onSaved={() => setIsEditingConfig(false)}
        />
      ) : null}
    </article>
  );
}
