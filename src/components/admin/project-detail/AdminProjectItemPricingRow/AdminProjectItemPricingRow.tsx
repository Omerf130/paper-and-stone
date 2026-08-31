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
import ProjectItemStatusHistoryPanel from "@/components/shared/ProjectItemStatusHistory/ProjectItemStatusHistoryPanel";
import { getProjectItemStatusWorkflowContext } from "@/lib/project-items/project-item-status-presentation";
import styles from "./AdminProjectItemPricingRow.module.scss";

type AdminProjectItemPricingRowProps = {
  projectId: string;
  item: ProjectItemView & { adminPricing: AdminProjectItemPricingView };
  isEditable: boolean;
  thumbnail?: ProductThumbnailView;
  onSaveSuccess?: () => void;
  onSaveError?: (message: string) => void;
};

function getPricingStatusLabel(
  pricingStatus: AdminProjectItemPricingView["pricingStatus"],
): string | null {
  switch (pricingStatus) {
    case "unpriced":
      return "ממתין לתמחור";
    case "needs_review":
      return "דורש בדיקת תמחור";
    case "priced":
      return null;
  }
}

export default function AdminProjectItemPricingRow({
  projectId,
  item,
  isEditable,
  thumbnail,
  onSaveSuccess,
  onSaveError,
}: AdminProjectItemPricingRowProps) {
  const pricing = item.adminPricing;
  const configRows = getProjectItemConfigurationRows(item);
  const sku = item.snapshot.sku ?? "—";
  const hasStatus = item.status != null;
  const workflowContext =
    item.status != null
      ? getProjectItemStatusWorkflowContext(item.status, "admin")
      : undefined;
  const pricingStatusLabel = getPricingStatusLabel(pricing.pricingStatus);

  const form = useAdminItemPricingForm({
    projectId,
    itemId: item.id,
    pricing,
    isEditable,
    onSaveSuccess,
    onSaveError,
  });

  const commercialMarginDisplay =
    form.previewCommercialMarginFormatted ??
    (pricing.hasCommercialMargin ? pricing.commercialMarginFormatted : null);
  const paperStoneProfitDisplay =
    form.previewPaperStoneProfitFormatted ??
    (pricing.hasPaperStoneProfit ? pricing.paperStoneProfitFormatted : null);
  const architectProfitDisplay =
    form.previewArchitectProfitFormatted ??
    (pricing.hasArchitectProfit ? pricing.architectProfitFormatted : null);

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
              {pricingStatusLabel ? (
                <StatusBadge tone={pricing.pricingStatus === "needs_review" ? "warning" : "info"}>
                  {pricingStatusLabel}
                </StatusBadge>
              ) : null}
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
            {workflowContext ? (
              <p className={styles.workflowContext}>{workflowContext}</p>
            ) : null}
            {item.statusHistory && item.statusHistory.length > 0 ? (
              <ProjectItemStatusHistoryPanel
                history={item.statusHistory}
                role="admin"
              />
            ) : null}
          </div>
        ) : null}
      </header>

      <hr className={styles.cardDivider} />

      <section className={styles.pricingSection} data-layer="pricing">
        <h5 className={styles.pricingHeading}>תמחור</h5>

        <div className={styles.pricingGrid}>
          <div className={styles.pricingField} data-pricing-field="product-price">
            {isEditable ? (
              <FormField
                label="מחיר המוצר (₪)"
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
                  placeholder="לא הוגדר"
                  aria-invalid={
                    form.fieldErrors.internalCostShekels ? true : undefined
                  }
                />
              </FormField>
            ) : (
              <>
                <p className={styles.fieldLabel}>מחיר המוצר (₪)</p>
                <p className={styles.readOnlyValue} dir="ltr">
                  {pricing.hasInternalCost
                    ? pricing.internalCostFormatted
                    : PRICING_ERRORS.COST_REQUIRED}
                </p>
              </>
            )}
          </div>

          <div className={styles.pricingField} data-pricing-field="client-price">
            {isEditable ? (
              <FormField
                label="מחיר סופי ללקוח (₪)"
                htmlFor={`client-price-${item.id}`}
                error={form.fieldErrors.clientPriceShekels}
              >
                <input
                  id={`client-price-${item.id}`}
                  className={formFieldStyles.input}
                  inputMode="decimal"
                  dir="ltr"
                  value={form.clientPriceShekels}
                  onChange={(event) =>
                    form.setClientPriceShekels(event.target.value)
                  }
                  disabled={form.isPending}
                  placeholder="לא הוגדר"
                  aria-invalid={
                    form.fieldErrors.clientPriceShekels ? true : undefined
                  }
                />
              </FormField>
            ) : (
              <>
                <p className={styles.fieldLabel}>מחיר סופי ללקוח (₪)</p>
                <p className={styles.readOnlyValue} dir="ltr">
                  {pricing.hasClientPrice
                    ? pricing.clientPriceFormatted
                    : "—"}
                </p>
              </>
            )}
          </div>

          <div className={styles.pricingField} data-pricing-field="architect-markup">
            {isEditable ? (
              <FormField
                label="מרקאפ אדריכל (%)"
                htmlFor={`architect-markup-${item.id}`}
                error={form.fieldErrors.architectMarkupPercent}
              >
                <input
                  id={`architect-markup-${item.id}`}
                  className={formFieldStyles.input}
                  inputMode="decimal"
                  dir="ltr"
                  value={form.architectMarkupPercent}
                  onChange={(event) =>
                    form.setArchitectMarkupPercent(event.target.value)
                  }
                  disabled={form.isPending}
                  placeholder="לדוגמה: 20"
                  aria-invalid={
                    form.fieldErrors.architectMarkupPercent ? true : undefined
                  }
                />
              </FormField>
            ) : (
              <>
                <p className={styles.fieldLabel}>מרקאפ אדריכל (%)</p>
                <p className={styles.readOnlyValue} dir="ltr">
                  {pricing.hasArchitectMarkup
                    ? `${pricing.architectMarkupPercent}%`
                    : PRICING_ERRORS.MARKUP_REQUIRED}
                </p>
              </>
            )}
          </div>

          <div className={styles.pricingField} data-pricing-field="commercial-margin">
            <div className={styles.summaryBlock}>
              <p className={styles.fieldLabel}>מרווח כולל (₪)</p>
              {commercialMarginDisplay ? (
                <p className={styles.summaryValue} dir="ltr">
                  {commercialMarginDisplay}
                </p>
              ) : (
                <p className={styles.summaryMissing}>—</p>
              )}
            </div>
          </div>

          <div className={styles.pricingField} data-pricing-field="architect-profit">
            <div className={styles.summaryBlock}>
              <p className={styles.fieldLabel}>רווח אדריכל (₪)</p>
              {architectProfitDisplay ? (
                <p className={styles.summaryValue} dir="ltr">
                  {architectProfitDisplay}
                </p>
              ) : (
                <p className={styles.summaryMissing}>—</p>
              )}
            </div>
          </div>

          <div className={styles.pricingField} data-pricing-field="paper-stone">
            <div className={styles.summaryBlock}>
              <p className={styles.fieldLabel}>רווח Paper & Stone (₪)</p>
              {paperStoneProfitDisplay ? (
                <p className={styles.summaryValue} dir="ltr">
                  {paperStoneProfitDisplay}
                </p>
              ) : (
                <p className={styles.summaryMissing}>—</p>
              )}
            </div>
          </div>
        </div>

        {pricing.clientLineTotalFormatted ? (
          <p className={styles.lineTotal} dir="ltr">
            סה״כ שורה ללקוח: {pricing.clientLineTotalFormatted}
          </p>
        ) : null}

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
