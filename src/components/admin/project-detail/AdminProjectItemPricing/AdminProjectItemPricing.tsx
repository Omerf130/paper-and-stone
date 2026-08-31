"use client";

import { useAdminItemPricingForm } from "@/lib/pricing/useAdminItemPricingForm";
import { PRICING_ERRORS } from "@/lib/pricing/pricing-validation";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import type { AdminProjectItemPricingView } from "@/types/project-pricing";
import styles from "./AdminProjectItemPricing.module.scss";

type AdminProjectItemPricingProps = {
  projectId: string;
  itemId: string;
  pricing: AdminProjectItemPricingView;
  isEditable: boolean;
};

export default function AdminProjectItemPricing({
  projectId,
  itemId,
  pricing,
  isEditable,
}: AdminProjectItemPricingProps) {
  const form = useAdminItemPricingForm({
    projectId,
    itemId,
    pricing,
    isEditable,
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

  if (!isEditable) {
    return (
      <div className={styles.pricingReadOnly}>
        <dl className={styles.summary}>
          <div className={styles.summaryItem}>
            <dt>מחיר המוצר</dt>
            <dd dir="ltr">
              {pricing.hasInternalCost
                ? pricing.internalCostFormatted
                : PRICING_ERRORS.COST_REQUIRED}
            </dd>
          </div>
          <div className={styles.summaryItem}>
            <dt>מחיר סופי ללקוח</dt>
            <dd dir="ltr">
              {pricing.hasClientPrice ? pricing.clientPriceFormatted : "—"}
            </dd>
          </div>
          <div className={styles.summaryItem}>
            <dt>מרקאפ אדריכל</dt>
            <dd dir="ltr">
              {pricing.hasArchitectMarkup
                ? `${pricing.architectMarkupPercent}%`
                : PRICING_ERRORS.MARKUP_REQUIRED}
            </dd>
          </div>
          <div className={styles.summaryItem}>
            <dt>מרווח כולל</dt>
            <dd dir="ltr">{commercialMarginDisplay ?? "—"}</dd>
          </div>
          <div className={styles.summaryItem}>
            <dt>רווח אדריכל</dt>
            <dd dir="ltr">{architectProfitDisplay ?? "—"}</dd>
          </div>
          <div className={styles.summaryItem}>
            <dt>רווח Paper & Stone</dt>
            <dd dir="ltr">{paperStoneProfitDisplay ?? "—"}</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <div className={styles.pricing}>
      <h4 className={styles.heading}>תמחור מסחרי</h4>
      <div className={styles.formGrid}>
        <FormField
          label="מחיר המוצר (₪)"
          htmlFor={`internal-cost-${itemId}`}
          error={form.fieldErrors.internalCostShekels}
        >
          <input
            id={`internal-cost-${itemId}`}
            className={formFieldStyles.input}
            inputMode="decimal"
            dir="ltr"
            value={form.internalCostShekels}
            onChange={(event) => form.setInternalCostShekels(event.target.value)}
            disabled={form.isPending}
            placeholder="0.00"
          />
        </FormField>
        <FormField
          label="מחיר סופי ללקוח (₪)"
          htmlFor={`client-price-${itemId}`}
          error={form.fieldErrors.clientPriceShekels}
        >
          <input
            id={`client-price-${itemId}`}
            className={formFieldStyles.input}
            inputMode="decimal"
            dir="ltr"
            value={form.clientPriceShekels}
            onChange={(event) => form.setClientPriceShekels(event.target.value)}
            disabled={form.isPending}
            placeholder="0.00"
          />
        </FormField>
        <FormField
          label="מרקאפ אדריכל (%)"
          htmlFor={`architect-markup-${itemId}`}
          error={form.fieldErrors.architectMarkupPercent}
        >
          <input
            id={`architect-markup-${itemId}`}
            className={formFieldStyles.input}
            inputMode="decimal"
            dir="ltr"
            value={form.architectMarkupPercent}
            onChange={(event) => form.setArchitectMarkupPercent(event.target.value)}
            disabled={form.isPending}
            placeholder="20"
          />
        </FormField>
        <div className={styles.preview}>
          <p className={styles.previewLabel}>מרווח כולל</p>
          <p className={styles.previewValue} dir="ltr">
            {commercialMarginDisplay ?? "—"}
          </p>
        </div>
        <div className={styles.preview}>
          <p className={styles.previewLabel}>רווח אדריכל</p>
          <p className={styles.previewValue} dir="ltr">
            {architectProfitDisplay ?? "—"}
          </p>
        </div>
        <div className={styles.preview}>
          <p className={styles.previewLabel}>רווח Paper & Stone</p>
          <p className={styles.previewValue} dir="ltr">
            {paperStoneProfitDisplay ?? "—"}
          </p>
        </div>
      </div>
      <div className={styles.actions}>
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
      </div>
    </div>
  );
}
