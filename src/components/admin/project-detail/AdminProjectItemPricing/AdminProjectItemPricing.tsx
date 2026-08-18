"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setProjectItemAdminPricingAction } from "@/app/admin/projects/pricing-actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { formatAgorotToShekelsInput } from "@/lib/money/parse-money-input";
import { formatIlsAgorot } from "@/lib/money/format-ils";
import {
  parseInternalCostInput,
  parseMarkupPercentageInput,
  PRICING_ERRORS,
} from "@/lib/pricing/pricing-validation";
import { calculateArchitectPriceAgorot } from "@/lib/pricing/pricing-calculations";
import type { AdminProjectItemPricingView } from "@/types/project-pricing";
import styles from "./AdminProjectItemPricing.module.scss";

type AdminProjectItemPricingProps = {
  projectId: string;
  itemId: string;
  pricing: AdminProjectItemPricingView;
  defaultAdminMarkupPercent?: string;
  isEditable: boolean;
};

export default function AdminProjectItemPricing({
  projectId,
  itemId,
  pricing,
  defaultAdminMarkupPercent,
  isEditable,
}: AdminProjectItemPricingProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [internalCostShekels, setInternalCostShekels] = useState(() =>
    pricing.internalCostAgorot != null
      ? formatAgorotToShekelsInput(pricing.internalCostAgorot)
      : "",
  );
  const [useProjectDefault, setUseProjectDefault] = useState(
    pricing.usesProjectAdminMarkup,
  );
  const [itemMarkupPercent, setItemMarkupPercent] = useState(
    pricing.usesProjectAdminMarkup ? "" : (pricing.adminMarkupPercent ?? ""),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const previewArchitectPrice = useMemo(() => {
    const costAgorot = parseInternalCostInput(internalCostShekels);
    if (costAgorot == null) {
      return null;
    }

    let markupBp: number | null = null;
    if (useProjectDefault) {
      if (defaultAdminMarkupPercent?.trim()) {
        markupBp = parseMarkupPercentageInput(defaultAdminMarkupPercent);
      } else if (pricing.adminMarkupBp != null && pricing.usesProjectAdminMarkup) {
        markupBp = pricing.adminMarkupBp;
      }
    } else if (itemMarkupPercent.trim()) {
      markupBp = parseMarkupPercentageInput(itemMarkupPercent);
    }

    if (markupBp == null) {
      return null;
    }

    return calculateArchitectPriceAgorot(costAgorot, markupBp);
  }, [
    internalCostShekels,
    useProjectDefault,
    itemMarkupPercent,
    defaultAdminMarkupPercent,
    pricing.adminMarkupBp,
    pricing.usesProjectAdminMarkup,
  ]);

  const handleSave = () => {
    setFieldErrors({});
    startTransition(async () => {
      const result = await setProjectItemAdminPricingAction({
        projectId,
        itemId,
        internalCostShekels,
        useProjectDefaultAdminMarkup: useProjectDefault,
        itemAdminMarkupPercent: useProjectDefault ? undefined : itemMarkupPercent,
        clearAdminMarkupOverride: useProjectDefault,
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

      toast({ type: "success", message: "התמחור נשמר" });
      router.refresh();
    });
  };

  const costDisplay = pricing.hasInternalCost
    ? pricing.internalCostFormatted
    : PRICING_ERRORS.COST_REQUIRED;
  const markupDisplay =
    pricing.adminMarkupPercent != null
      ? `${pricing.adminMarkupPercent}%`
      : PRICING_ERRORS.MARKUP_REQUIRED;

  if (!isEditable) {
    return (
      <div className={styles.pricingReadOnly}>
        <dl className={styles.summary}>
          <div className={styles.summaryItem}>
            <dt>עלות פנימית</dt>
            <dd dir="ltr">{costDisplay}</dd>
          </div>
          <div className={styles.summaryItem}>
            <dt>Markup אדמין</dt>
            <dd dir="ltr">
              {markupDisplay}
              {pricing.usesProjectAdminMarkup ? (
                <span className={styles.inherited}> (ברירת מחדל)</span>
              ) : null}
            </dd>
          </div>
          <div className={styles.summaryItem}>
            <dt>מחיר לאדריכל</dt>
            <dd dir="ltr">
              {pricing.hasArchitectPrice
                ? pricing.architectPriceFormatted
                : "—"}
            </dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <div className={styles.pricing}>
      <h4 className={styles.heading}>תמחור אדמין</h4>
      <div className={styles.formGrid}>
        <FormField
          label="עלות פנימית (₪)"
          htmlFor={`internal-cost-${itemId}`}
          error={fieldErrors.internalCostShekels}
        >
          <input
            id={`internal-cost-${itemId}`}
            className={formFieldStyles.input}
            inputMode="decimal"
            dir="ltr"
            value={internalCostShekels}
            onChange={(event) => setInternalCostShekels(event.target.value)}
            disabled={isPending}
            placeholder="0.00"
            aria-invalid={fieldErrors.internalCostShekels ? true : undefined}
          />
        </FormField>

        <fieldset className={styles.markupFieldset}>
          <legend className={styles.legend}>Markup אדמין</legend>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name={`admin-markup-mode-${itemId}`}
              checked={useProjectDefault}
              onChange={() => setUseProjectDefault(true)}
              disabled={isPending}
            />
            <span>
              ברירת מחדל לפרויקט
              {defaultAdminMarkupPercent
                ? ` (${defaultAdminMarkupPercent}%)`
                : pricing.usesProjectAdminMarkup && pricing.adminMarkupPercent
                  ? ` (${pricing.adminMarkupPercent}%)`
                  : ""}
            </span>
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name={`admin-markup-mode-${itemId}`}
              checked={!useProjectDefault}
              onChange={() => setUseProjectDefault(false)}
              disabled={isPending}
            />
            <span>דריסה למוצר</span>
          </label>
          {!useProjectDefault ? (
            <FormField
              label="Markup למוצר (%)"
              htmlFor={`item-admin-markup-${itemId}`}
              error={fieldErrors.itemAdminMarkupPercent}
            >
              <input
                id={`item-admin-markup-${itemId}`}
                className={formFieldStyles.input}
                inputMode="decimal"
                dir="ltr"
                value={itemMarkupPercent}
                onChange={(event) => setItemMarkupPercent(event.target.value)}
                disabled={isPending}
                aria-invalid={
                  fieldErrors.itemAdminMarkupPercent ? true : undefined
                }
              />
            </FormField>
          ) : null}
        </fieldset>

        <div className={styles.preview}>
          <p className={styles.previewLabel}>תצוגה מקדימה — מחיר לאדריכל</p>
          <p className={styles.previewValue} dir="ltr">
            {previewArchitectPrice != null
              ? formatIlsAgorot(previewArchitectPrice)
              : internalCostShekels.trim() && !previewArchitectPrice
                ? PRICING_ERRORS.MARKUP_REQUIRED
                : PRICING_ERRORS.COST_REQUIRED}
          </p>
          {pricing.hasArchitectPrice && previewArchitectPrice == null ? (
            <p className={styles.savedValue} dir="ltr">
              שמור: {pricing.architectPriceFormatted}
            </p>
          ) : null}
        </div>
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
          שמירת תמחור
        </Button>
      </div>
    </div>
  );
}
