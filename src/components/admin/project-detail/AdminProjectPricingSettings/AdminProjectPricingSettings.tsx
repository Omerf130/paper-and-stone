"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setProjectDefaultAdminMarkupAction } from "@/app/admin/projects/pricing-actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { ProjectPricingSettingsView } from "@/types/project-pricing";
import styles from "./AdminProjectPricingSettings.module.scss";

type AdminProjectPricingSettingsProps = {
  projectId: string;
  settings: ProjectPricingSettingsView;
};

export default function AdminProjectPricingSettings({
  projectId,
  settings,
}: AdminProjectPricingSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [markupPercent, setMarkupPercent] = useState(
    settings.defaultAdminMarkupPercent ?? "",
  );
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  if (!settings.usesLayeredPricing) {
    return null;
  }

  const handleSave = () => {
    setFieldError(undefined);
    startTransition(async () => {
      const result = await setProjectDefaultAdminMarkupAction(
        projectId,
        markupPercent,
      );

      if (result.fieldErrors?.defaultAdminMarkupPercent) {
        setFieldError(result.fieldErrors.defaultAdminMarkupPercent);
        return;
      }

      if (result.error) {
        toast({ type: "error", message: result.error });
        return;
      }

      toast({ type: "success", message: "ברירת המחדל ל-Markup נשמרה" });
      router.refresh();
    });
  };

  const isEditable = settings.isAdminPricingEditable;

  return (
    <section className={styles.settings} aria-labelledby="admin-pricing-settings-title">
      <h3 id="admin-pricing-settings-title" className={styles.title}>
        הגדרות תמחור — Markup אדמין
      </h3>
      <p className={styles.description}>
        Markup ברירת מחדל לכל המוצרים בפרויקט. ניתן לדרוס ברמת מוצר בודד.
      </p>
      {!isEditable && settings.adminPricingUnavailableReason ? (
        <p className={styles.notice} role="status">
          {settings.adminPricingUnavailableReason}
        </p>
      ) : null}
      <div className={styles.formRow}>
        <FormField
          label="Markup אדמין ברירת מחדל (%)"
          htmlFor="default-admin-markup"
          hint="אחוז Markup מעל עלות פנימית → מחיר לאדריכל"
          error={fieldError}
        >
          <input
            id="default-admin-markup"
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
