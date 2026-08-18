"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setProjectDefaultArchitectMarkupAction } from "@/app/professional/projects/pricing-actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { ArchitectProjectPricingSettingsView } from "@/types/project-pricing";
import styles from "./ArchitectProjectPricingSettings.module.scss";

type ArchitectProjectPricingSettingsProps = {
  projectId: string;
  settings: ArchitectProjectPricingSettingsView;
};

export default function ArchitectProjectPricingSettings({
  projectId,
  settings,
}: ArchitectProjectPricingSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [markupPercent, setMarkupPercent] = useState(
    settings.defaultArchitectMarkupPercent ?? "",
  );
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  if (!settings.usesLayeredPricing) {
    return null;
  }

  const handleSave = () => {
    setFieldError(undefined);
    startTransition(async () => {
      const result = await setProjectDefaultArchitectMarkupAction(
        projectId,
        markupPercent,
      );

      if (result.fieldErrors?.defaultArchitectMarkupPercent) {
        setFieldError(result.fieldErrors.defaultArchitectMarkupPercent);
        return;
      }

      if (result.error) {
        toast({ type: "error", message: result.error });
        return;
      }

      toast({ type: "success", message: "ברירת המחדל ל-Markup ללקוח נשמרה" });
      router.refresh();
    });
  };

  const isEditable = settings.isArchitectPricingEditable;

  return (
    <section
      className={styles.settings}
      aria-labelledby="architect-pricing-settings-title"
    >
      <h3 id="architect-pricing-settings-title" className={styles.title}>
        ברירת מחדל — Markup ללקוח
      </h3>
      <p className={styles.description}>
        אחוז ברירת מחדל מעל מחיר עבורך → מחיר ללקוח. ניתן להתאים לכל מוצר.
      </p>
      {!isEditable && settings.architectPricingUnavailableReason ? (
        <p className={styles.notice} role="status">
          {settings.architectPricingUnavailableReason}
        </p>
      ) : null}
      <div className={styles.formRow}>
        <FormField
          label="Markup ללקוח ברירת מחדל (%)"
          htmlFor="default-architect-markup"
          error={fieldError}
        >
          <input
            id="default-architect-markup"
            className={formFieldStyles.input}
            inputMode="decimal"
            dir="ltr"
            value={markupPercent}
            onChange={(event) => setMarkupPercent(event.target.value)}
            disabled={!isEditable || isPending}
            aria-invalid={fieldError ? true : undefined}
          />
        </FormField>
        {isEditable ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSave}
            loading={isPending}
            loadingLabel="שומר..."
            disabled={isPending}
          >
            שמירה
          </Button>
        ) : null}
      </div>
    </section>
  );
}
