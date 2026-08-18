"use client";

import { useAdminItemPricingForm } from "@/lib/pricing/useAdminItemPricingForm";
import { PRICING_ERRORS } from "@/lib/pricing/pricing-validation";
import { getProjectItemConfigurationRows } from "@/lib/projects/project-display-helpers";
import type { ProductThumbnailView } from "@/lib/products/loadProductThumbnailMap";
import type { ProjectItemView } from "@/types/project";
import type { AdminProjectItemPricingView } from "@/types/project-pricing";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import styles from "./AdminProjectItemPricingRow.module.scss";

type AdminProjectItemPricingRowProps = {
  projectId: string;
  item: ProjectItemView & { adminPricing: AdminProjectItemPricingView };
  defaultAdminMarkupPercent?: string;
  isEditable: boolean;
  thumbnail?: ProductThumbnailView;
  onSaveSuccess?: () => void;
  onSaveError?: (message: string) => void;
};

export default function AdminProjectItemPricingRow({
  projectId,
  item,
  defaultAdminMarkupPercent,
  isEditable,
  thumbnail,
  onSaveSuccess,
  onSaveError,
}: AdminProjectItemPricingRowProps) {
  const pricing = item.adminPricing;
  const configRows = getProjectItemConfigurationRows(item);
  const sku = item.snapshot.sku ?? "—";

  const form = useAdminItemPricingForm({
    projectId,
    itemId: item.id,
    pricing,
    defaultAdminMarkupPercent,
    isEditable,
    onSaveSuccess,
    onSaveError,
  });

  const defaultMarkupLabel = defaultAdminMarkupPercent
    ? `ברירת מחדל ${defaultAdminMarkupPercent}%`
    : pricing.adminMarkupPercent && pricing.usesProjectAdminMarkup
      ? `ברירת מחדל ${pricing.adminMarkupPercent}%`
      : "ברירת מחדל";

  return (
    <article className={styles.row} aria-labelledby={`item-${item.id}-name`}>
      <div className={styles.identity}>
        <div className={styles.imageWrap}>
          {thumbnail?.url ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail from known product media URLs
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
          <h4 id={`item-${item.id}-name`} className={styles.productName}>
            {item.snapshot.productName}
          </h4>
          <p className={styles.productCode} dir="ltr">
            {sku}
          </p>
          {configRows.length > 0 ? (
            <p className={styles.configSummary}>
              {configRows.map((row) => row.value).join(" · ")}
            </p>
          ) : null}
          <p className={styles.quantity}>כמות: {item.quantity}</p>
          {!item.isProductActive ? (
            <StatusBadge tone="warning">המוצר אינו פעיל</StatusBadge>
          ) : null}
        </div>
      </div>

      <div className={styles.pricingGrid}>
        <FormField
          label="עלות פנימית (₪)"
          htmlFor={`internal-cost-${item.id}`}
          error={form.fieldErrors.internalCostShekels}
        >
          {isEditable ? (
            <input
              id={`internal-cost-${item.id}`}
              className={formFieldStyles.input}
              inputMode="decimal"
              dir="ltr"
              value={form.internalCostShekels}
              onChange={(event) => form.setInternalCostShekels(event.target.value)}
              disabled={form.isPending}
              placeholder="לא הוגדרה עלות"
              aria-invalid={form.fieldErrors.internalCostShekels ? true : undefined}
            />
          ) : (
            <p className={styles.readOnlyValue} dir="ltr">
              {pricing.hasInternalCost
                ? pricing.internalCostFormatted
                : PRICING_ERRORS.COST_REQUIRED}
            </p>
          )}
        </FormField>

        <FormField
          label="Markup אדמין"
          htmlFor={`markup-mode-${item.id}`}
          error={form.fieldErrors.itemAdminMarkupPercent}
        >
          {isEditable ? (
            <div className={styles.markupControls}>
              <select
                id={`markup-mode-${item.id}`}
                className={formFieldStyles.input}
                value={form.markupMode}
                onChange={(event) =>
                  form.setMarkupMode(event.target.value as "default" | "override")
                }
                disabled={form.isPending}
              >
                <option value="default">שימוש ב{defaultMarkupLabel}</option>
                <option value="override">התאמה למוצר</option>
              </select>
              {form.markupMode === "override" ? (
                <input
                  id={`item-admin-markup-${item.id}`}
                  className={formFieldStyles.input}
                  inputMode="decimal"
                  dir="ltr"
                  value={form.itemMarkupPercent}
                  onChange={(event) => form.setItemMarkupPercent(event.target.value)}
                  disabled={form.isPending}
                  placeholder="%"
                  aria-label="Markup למוצר"
                  aria-invalid={
                    form.fieldErrors.itemAdminMarkupPercent ? true : undefined
                  }
                />
              ) : null}
            </div>
          ) : (
            <p className={styles.readOnlyValue} dir="ltr">
              {pricing.adminMarkupPercent != null
                ? `${pricing.adminMarkupPercent}%`
                : PRICING_ERRORS.MARKUP_REQUIRED}
              {pricing.usesProjectAdminMarkup ? " (ברירת מחדל)" : ""}
            </p>
          )}
        </FormField>

        <div className={styles.previewBlock}>
          <p className={styles.previewLabel}>מחיר אדריכל</p>
          <p className={styles.previewValue} dir="ltr">
            {form.previewArchitectPriceFormatted ??
              (pricing.hasArchitectPrice ? pricing.architectPriceFormatted : "—")}
          </p>
        </div>

        <div className={styles.clientBlock}>
          <p className={styles.previewLabel}>מחיר לקוח</p>
          <p className={styles.previewValue} dir="ltr">
            {pricing.hasClientPrice ? pricing.clientPriceFormatted : "—"}
          </p>
          {pricing.clientPriceStale ? (
            <p className={styles.staleWarning} role="status">
              מחיר הלקוח דורש בדיקה
            </p>
          ) : null}
        </div>
      </div>

      {isEditable ? (
        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="sm"
            onClick={form.handleSave}
            loading={form.isPending}
            loadingLabel="שומר..."
            disabled={!form.isDirty || form.isPending}
          >
            שמירה
          </Button>
          {form.isDirty ? (
            <span className={styles.dirtyHint} role="status">
              יש שינויים שלא נשמרו
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
