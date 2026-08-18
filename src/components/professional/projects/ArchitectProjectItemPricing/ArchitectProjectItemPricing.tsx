"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setProjectItemArchitectPricingAction } from "@/app/professional/projects/pricing-actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { formatIlsAgorot } from "@/lib/money/format-ils";
import {
  parseMarkupPercentageInput,
  PRICING_ERRORS,
} from "@/lib/pricing/pricing-validation";
import { calculateClientPriceAgorot } from "@/lib/pricing/pricing-calculations";
import StaleClientPriceWarning from "@/components/professional/projects/StaleClientPriceWarning/StaleClientPriceWarning";
import type { ArchitectProjectItemPricingView } from "@/types/project-pricing";
import styles from "./ArchitectProjectItemPricing.module.scss";

type ArchitectProjectItemPricingProps = {
  projectId: string;
  itemId: string;
  pricing: ArchitectProjectItemPricingView;
  defaultArchitectMarkupPercent?: string;
  isEditable: boolean;
};

export default function ArchitectProjectItemPricing({
  projectId,
  itemId,
  pricing,
  defaultArchitectMarkupPercent,
  isEditable,
}: ArchitectProjectItemPricingProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [useProjectDefault, setUseProjectDefault] = useState(
    pricing.usesProjectArchitectMarkup,
  );
  const [itemMarkupPercent, setItemMarkupPercent] = useState(
    pricing.usesProjectArchitectMarkup ? "" : (pricing.architectMarkupPercent ?? ""),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const previewClientPrice = useMemo(() => {
    if (!pricing.hasArchitectPrice || pricing.architectPriceAgorot == null) {
      return null;
    }

    let markupBp: number | null = null;
    if (useProjectDefault) {
      if (defaultArchitectMarkupPercent?.trim()) {
        markupBp = parseMarkupPercentageInput(defaultArchitectMarkupPercent);
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
    defaultArchitectMarkupPercent,
  ]);

  const handleSave = () => {
    setFieldErrors({});
    startTransition(async () => {
      const result = await setProjectItemArchitectPricingAction({
        projectId,
        itemId,
        useProjectDefaultArchitectMarkup: useProjectDefault,
        itemArchitectMarkupPercent: useProjectDefault
          ? undefined
          : itemMarkupPercent,
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

  if (!pricing.hasArchitectPrice) {
    return (
      <p className={styles.unavailable}>{PRICING_ERRORS.ARCHITECT_PRICE_REQUIRED}</p>
    );
  }

  const clientPriceDisplay = pricing.clientPriceStale
    ? pricing.clientPriceFormatted
    : pricing.hasClientPrice
      ? pricing.clientPriceFormatted
      : PRICING_ERRORS.MARKUP_REQUIRED;

  if (!isEditable) {
    return (
      <div className={styles.pricingReadOnly}>
        {pricing.clientPriceStale ? <StaleClientPriceWarning /> : null}
        <dl className={styles.summary}>
          <div className={styles.summaryItem}>
            <dt>מחיר לאדריכל</dt>
            <dd dir="ltr">{pricing.architectPriceFormatted}</dd>
          </div>
          <div className={styles.summaryItem}>
            <dt>Markup ללקוח</dt>
            <dd dir="ltr">
              {pricing.architectMarkupPercent != null
                ? `${pricing.architectMarkupPercent}%`
                : PRICING_ERRORS.MARKUP_REQUIRED}
              {pricing.usesProjectArchitectMarkup ? (
                <span className={styles.inherited}> (ברירת מחדל)</span>
              ) : null}
            </dd>
          </div>
          <div className={styles.summaryItem}>
            <dt>מחיר ללקוח</dt>
            <dd dir="ltr">{clientPriceDisplay}</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <div className={styles.pricing}>
      {pricing.clientPriceStale ? <StaleClientPriceWarning /> : null}

      <h4 className={styles.heading}>תמחור ללקוח</h4>

      <dl className={styles.architectPrice}>
        <dt>מחיר לאדריכל (קבוע)</dt>
        <dd dir="ltr">{pricing.architectPriceFormatted}</dd>
      </dl>

      <fieldset className={styles.markupFieldset}>
        <legend className={styles.legend}>Markup ללקוח</legend>
        <label className={styles.radioLabel}>
          <input
            type="radio"
            name={`architect-markup-mode-${itemId}`}
            checked={useProjectDefault}
            onChange={() => setUseProjectDefault(true)}
            disabled={isPending}
          />
          <span>
            ברירת מחדל לפרויקט
            {defaultArchitectMarkupPercent
              ? ` (${defaultArchitectMarkupPercent}%)`
              : pricing.usesProjectArchitectMarkup && pricing.architectMarkupPercent
                ? ` (${pricing.architectMarkupPercent}%)`
                : ""}
          </span>
        </label>
        <label className={styles.radioLabel}>
          <input
            type="radio"
            name={`architect-markup-mode-${itemId}`}
            checked={!useProjectDefault}
            onChange={() => setUseProjectDefault(false)}
            disabled={isPending}
          />
          <span>דריסה למוצר</span>
        </label>
        {!useProjectDefault ? (
          <FormField
            label="Markup למוצר (%)"
            htmlFor={`item-architect-markup-${itemId}`}
            error={fieldErrors.itemArchitectMarkupPercent}
          >
            <input
              id={`item-architect-markup-${itemId}`}
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

      <div className={styles.preview}>
        <p className={styles.previewLabel}>מחיר ללקוח</p>
        <p className={styles.previewValue} dir="ltr">
          {previewClientPrice != null
            ? formatIlsAgorot(previewClientPrice)
            : PRICING_ERRORS.MARKUP_REQUIRED}
        </p>
        {pricing.hasClientPrice && !pricing.clientPriceStale ? (
          <p className={styles.savedValue} dir="ltr">
            שמור: {pricing.clientPriceFormatted}
          </p>
        ) : null}
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
    </div>
  );
}
