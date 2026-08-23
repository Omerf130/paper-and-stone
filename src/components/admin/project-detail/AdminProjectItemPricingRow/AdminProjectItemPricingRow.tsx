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
import AdminProjectItemStatusControl from "@/components/admin/project-detail/AdminProjectItemStatusControl/AdminProjectItemStatusControl";
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
  const hasStatus = item.status != null;

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

  const architectPriceDisplay =
    form.previewArchitectPriceFormatted ??
    (pricing.hasArchitectPrice ? pricing.architectPriceFormatted : null);

  const clientPriceDisplay = pricing.hasClientPrice
    ? pricing.clientPriceFormatted
    : null;

  return (
    <article className={styles.card} aria-labelledby={`item-${item.id}-name`}>
      <header className={styles.cardHeader} data-layer="header">
        <div className={styles.productIdentity} data-section="product">
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
        </div>

        {hasStatus ? (
          <div className={styles.workflowState} data-section="workflow">
            <AdminProjectItemStatusControl
              projectId={projectId}
              projectItemId={item.id}
              status={item.status!}
              presentation={item.statusPresentation}
            />
          </div>
        ) : null}
      </header>

      <hr className={styles.cardDivider} />

      <section className={styles.pricingSection} data-layer="pricing">
        <h5 className={styles.pricingHeading}>תמחור</h5>

        <div className={styles.pricingGrid}>
          <div className={styles.pricingField} data-pricing-field="internal">
            {isEditable ? (
              <FormField
                label="עלות פנימית (₪)"
                htmlFor={`internal-cost-${item.id}`}
                error={form.fieldErrors.internalCostShekels}
              >
                <input
                  id={`internal-cost-${item.id}`}
                  className={formFieldStyles.input}
                  inputMode="decimal"
                  dir="ltr"
                  value={form.internalCostShekels}
                  onChange={(event) =>
                    form.setInternalCostShekels(event.target.value)
                  }
                  disabled={form.isPending}
                  placeholder="לא הוגדרה עלות"
                  aria-invalid={
                    form.fieldErrors.internalCostShekels ? true : undefined
                  }
                />
              </FormField>
            ) : (
              <>
                <p className={styles.fieldLabel}>עלות פנימית (₪)</p>
                <p className={styles.readOnlyValue} dir="ltr">
                  {pricing.hasInternalCost
                    ? pricing.internalCostFormatted
                    : PRICING_ERRORS.COST_REQUIRED}
                </p>
              </>
            )}
          </div>

          <div className={styles.pricingField} data-pricing-field="markup">
            {isEditable ? (
              <FormField
                label="Markup אדמין"
                htmlFor={`markup-mode-${item.id}`}
                error={form.fieldErrors.itemAdminMarkupPercent}
              >
                <div className={styles.markupControls}>
                  <select
                    id={`markup-mode-${item.id}`}
                    className={`${formFieldStyles.input} ${styles.markupModeSelect}`}
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
                      className={`${formFieldStyles.input} ${styles.markupOverrideInput}`}
                      inputMode="decimal"
                      dir="ltr"
                      value={form.itemMarkupPercent}
                      onChange={(event) =>
                        form.setItemMarkupPercent(event.target.value)
                      }
                      disabled={form.isPending}
                      placeholder="%"
                      aria-label="Markup למוצר"
                      aria-invalid={
                        form.fieldErrors.itemAdminMarkupPercent ? true : undefined
                      }
                    />
                  ) : null}
                </div>
              </FormField>
            ) : (
              <>
                <p className={styles.fieldLabel}>Markup אדמין</p>
                <p className={styles.readOnlyValue} dir="ltr">
                  {pricing.adminMarkupPercent != null
                    ? `${pricing.adminMarkupPercent}%`
                    : PRICING_ERRORS.MARKUP_REQUIRED}
                  {pricing.usesProjectAdminMarkup ? " (ברירת מחדל)" : ""}
                </p>
              </>
            )}
          </div>

          <div className={styles.pricingField} data-pricing-field="architect">
            <div className={styles.summaryBlock}>
              <p className={styles.fieldLabel}>מחיר אדריכל</p>
              {architectPriceDisplay ? (
                <p className={styles.summaryValue} dir="ltr">
                  {architectPriceDisplay}
                </p>
              ) : (
                <p className={styles.summaryMissing}>—</p>
              )}
            </div>
          </div>

          <div className={styles.pricingField} data-pricing-field="client">
            <div className={styles.summaryBlock}>
              <p className={styles.fieldLabel}>מחיר לקוח</p>
              {clientPriceDisplay ? (
                <p className={styles.summaryValue} dir="ltr">
                  {clientPriceDisplay}
                </p>
              ) : (
                <p className={styles.summaryMissing}>—</p>
              )}
              {pricing.clientPriceStale ? (
                <p className={styles.staleWarning} role="status">
                  מחיר הלקוח דורש בדיקה
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {isEditable ? (
          <footer className={styles.pricingFooter}>
            <Button
              variant="secondary"
              size="sm"
              onClick={form.handleSave}
              loading={form.isPending}
              loadingLabel="שומר..."
              disabled={!form.isDirty || form.isPending}
            >
              שמירת תמחור
            </Button>
            {form.isDirty ? (
              <span className={styles.dirtyHint} role="status">
                יש שינויי תמחור שלא נשמרו
              </span>
            ) : null}
          </footer>
        ) : null}
      </section>
    </article>
  );
}
