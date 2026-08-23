"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setProjectItemArchitectPricingAction } from "@/app/professional/projects/pricing-actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { formatIlsAgorot } from "@/lib/money/format-ils";
import {
  parseMarkupPercentageInput,
  PRICING_ERRORS,
} from "@/lib/pricing/pricing-validation";
import { calculateClientPriceAgorot } from "@/lib/pricing/pricing-calculations";
import { getProjectItemConfigurationRows } from "@/lib/projects/project-display-helpers";
import StaleClientPriceWarning from "@/components/professional/projects/StaleClientPriceWarning/StaleClientPriceWarning";
import ArchitectProjectItemStatusControl from "@/components/professional/projects/ArchitectProjectItemStatusControl/ArchitectProjectItemStatusControl";
import ProjectItemStatusHistoryPanel from "@/components/shared/ProjectItemStatusHistory/ProjectItemStatusHistoryPanel";
import { getProjectItemStatusWorkflowContext } from "@/lib/project-items/project-item-status-presentation";
import ProjectItemEditor from "@/components/professional/projects/ProjectItemEditor/ProjectItemEditor";
import type { ProductThumbnailView } from "@/lib/products/loadProductThumbnailMap";
import type { ProjectItemView } from "@/types/project";
import type {
  ArchitectProjectItemPricingView,
  ArchitectProjectPricingSettingsView,
} from "@/types/project-pricing";
import type { ProductView } from "@/types/product";
import styles from "./ArchitectProjectItemCard.module.scss";

type ArchitectProjectItemCardProps = {
  projectId: string;
  item: ProjectItemView;
  pricing: ArchitectProjectItemPricingView;
  pricingSettings: ArchitectProjectPricingSettingsView;
  thumbnail?: ProductThumbnailView;
  productView?: ProductView;
  isEditable: boolean;
  showMove?: boolean;
  onMove?: () => void;
  onRemove?: () => void;
};

export default function ArchitectProjectItemCard({
  projectId,
  item,
  pricing,
  pricingSettings,
  thumbnail,
  productView,
  isEditable,
  showMove = false,
  onMove,
  onRemove,
}: ArchitectProjectItemCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [useProjectDefault, setUseProjectDefault] = useState(
    pricing.usesProjectArchitectMarkup,
  );
  const [itemMarkupPercent, setItemMarkupPercent] = useState(
    pricing.usesProjectArchitectMarkup ? "" : (pricing.architectMarkupPercent ?? ""),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [isPending, startTransition] = useTransition();

  const configRows = getProjectItemConfigurationRows(item);
  const sku = item.snapshot.sku ?? "—";
  const defaultMarkupPercent = pricingSettings.defaultArchitectMarkupPercent;

  const previewClientPrice = useMemo(() => {
    if (!pricing.hasArchitectPrice || pricing.architectPriceAgorot == null) {
      return null;
    }

    let markupBp: number | null = null;
    if (useProjectDefault) {
      if (defaultMarkupPercent?.trim()) {
        markupBp = parseMarkupPercentageInput(defaultMarkupPercent);
      } else if (
        pricing.architectMarkupBp != null &&
        pricing.usesProjectArchitectMarkup
      ) {
        markupBp = pricing.architectMarkupBp;
      }
    } else if (itemMarkupPercent.trim()) {
      markupBp = parseMarkupPercentageInput(itemMarkupPercent);
    }

    if (markupBp == null) {
      return null;
    }

    return calculateClientPriceAgorot(pricing.architectPriceAgorot, markupBp);
  }, [
    pricing.hasArchitectPrice,
    pricing.architectPriceAgorot,
    pricing.architectMarkupBp,
    pricing.usesProjectArchitectMarkup,
    useProjectDefault,
    itemMarkupPercent,
    defaultMarkupPercent,
  ]);

  const handleSave = () => {
    setFieldErrors({});
    startTransition(async () => {
      const result = await setProjectItemArchitectPricingAction({
        projectId,
        itemId: item.id,
        useProjectDefaultArchitectMarkup: useProjectDefault,
        itemArchitectMarkupPercent: useProjectDefault ? undefined : itemMarkupPercent,
        clearArchitectMarkupOverride: useProjectDefault,
        expectedPriceVersion: pricing.priceVersion,
      });

      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
        return;
      }

      if (result.error) {
        toast({ type: "error", message: result.error });
        return;
      }

      toast({ type: "success", message: "מחיר הלקוח נשמר" });
      router.refresh();
    });
  };

  const canEditPricing =
    isEditable && pricingSettings.isArchitectPricingEditable && pricing.hasArchitectPrice;

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

      {!pricing.hasArchitectPrice ? (
        <p className={styles.waiting}>{PRICING_ERRORS.ARCHITECT_PRICE_REQUIRED}</p>
      ) : (
        <div className={styles.pricingSection}>
          {pricing.clientPriceStale ? <StaleClientPriceWarning /> : null}

          <div className={styles.priceRow}>
            <span className={styles.priceLabel}>מחיר עבורך</span>
            <span className={styles.priceValue} dir="ltr">
              {pricing.architectPriceFormatted}
            </span>
          </div>

          {canEditPricing ? (
            <>
              <fieldset className={styles.markupFieldset}>
                <legend className={styles.markupLegend}>Markup ללקוח</legend>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name={`arch-markup-${item.id}`}
                    checked={useProjectDefault}
                    onChange={() => setUseProjectDefault(true)}
                    disabled={isPending}
                  />
                  <span>
                    ברירת מחדל
                    {defaultMarkupPercent ? ` (${defaultMarkupPercent}%)` : ""}
                  </span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name={`arch-markup-${item.id}`}
                    checked={!useProjectDefault}
                    onChange={() => setUseProjectDefault(false)}
                    disabled={isPending}
                  />
                  <span>התאמה למוצר</span>
                </label>
                {!useProjectDefault ? (
                  <FormField
                    label="אחוז ללקוח"
                    htmlFor={`arch-markup-input-${item.id}`}
                    error={fieldErrors.itemArchitectMarkupPercent}
                  >
                    <input
                      id={`arch-markup-input-${item.id}`}
                      className={formFieldStyles.input}
                      inputMode="decimal"
                      dir="ltr"
                      value={itemMarkupPercent}
                      onChange={(event) => setItemMarkupPercent(event.target.value)}
                      disabled={isPending}
                      aria-invalid={
                        fieldErrors.itemArchitectMarkupPercent ? true : undefined
                      }
                    />
                  </FormField>
                ) : null}
              </fieldset>

              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>מחיר ללקוח</span>
                <span className={styles.priceValue} dir="ltr">
                  {previewClientPrice != null
                    ? formatIlsAgorot(previewClientPrice)
                    : PRICING_ERRORS.MARKUP_REQUIRED}
                </span>
              </div>

              <div className={styles.actions}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSave}
                  loading={isPending}
                  loadingLabel="שומר..."
                  disabled={isPending}
                >
                  שמירת מחיר ללקוח
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Markup ללקוח</span>
                <span className={styles.priceValue} dir="ltr">
                  {pricing.architectMarkupPercent != null
                    ? `${pricing.architectMarkupPercent}%`
                    : PRICING_ERRORS.MARKUP_REQUIRED}
                </span>
              </div>
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>מחיר ללקוח</span>
                <span className={styles.priceValue} dir="ltr">
                  {pricing.hasClientPrice && !pricing.clientPriceStale
                    ? pricing.clientPriceFormatted
                    : PRICING_ERRORS.MARKUP_REQUIRED}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {isEditable ? (
        <div className={styles.itemActions}>
          {showMove && onMove ? (
            <Button variant="ghost" size="sm" onClick={onMove} disabled={isPending}>
              העברת חדר
            </Button>
          ) : null}
          {productView ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingConfig((current) => !current)}
              disabled={isPending}
            >
              {isEditingConfig ? "סגירת עריכה" : "עריכת תצורה"}
            </Button>
          ) : null}
          {onRemove ? (
            <Button variant="ghost" size="sm" onClick={onRemove} disabled={isPending}>
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
