"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setProjectDefaultAdminMarkupAction } from "@/app/admin/projects/pricing-actions";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { ProjectPricingSettingsView } from "@/types/project-pricing";
import styles from "./AdminProjectWorkspaceMarkupHeader.module.scss";

type AdminProjectWorkspaceMarkupHeaderProps = {
  projectId: string;
  settings: ProjectPricingSettingsView;
  affectedItemCount: number;
};

export default function AdminProjectWorkspaceMarkupHeader({
  projectId,
  settings,
  affectedItemCount,
}: AdminProjectWorkspaceMarkupHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [markupPercent, setMarkupPercent] = useState(
    settings.defaultAdminMarkupPercent ?? "",
  );
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isEditable = settings.isAdminPricingEditable;
  const savedMarkup = settings.defaultAdminMarkupPercent ?? "";
  const isDirty = markupPercent.trim() !== savedMarkup.trim();

  const handleSave = () => {
    if (affectedItemCount > 0) {
      setConfirmOpen(true);
      return;
    }

    submitSave();
  };

  const submitSave = () => {
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
      setConfirmOpen(false);
      router.refresh();
    });
  };

  if (!settings.usesLayeredPricing) {
    return null;
  }

  return (
    <section className={styles.settings} aria-labelledby="workspace-markup-title">
      <h3 id="workspace-markup-title" className={styles.title}>
        Markup אדמין — ברירת מחדל לפרויקט
      </h3>
      {!isEditable && settings.adminPricingUnavailableReason ? (
        <p className={styles.notice} role="status">
          {settings.adminPricingUnavailableReason}
        </p>
      ) : null}
      <div className={styles.formRow}>
        <FormField
          label="Markup ברירת מחדל (%)"
          htmlFor="workspace-default-admin-markup"
          error={fieldError}
        >
          <input
            id="workspace-default-admin-markup"
            className={formFieldStyles.input}
            inputMode="decimal"
            dir="ltr"
            value={markupPercent}
            onChange={(event) => setMarkupPercent(event.target.value)}
            disabled={!isEditable || isPending}
          />
        </FormField>
        {isEditable ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSave}
            loading={isPending}
            loadingLabel="שומר..."
            disabled={!isDirty || isPending}
          >
            שמירה
          </Button>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="עדכון Markup ברירת מחדל"
        description={
          affectedItemCount > 0
            ? `שינוי ברירת המחדל עשוי לעדכן מחירי אדריכל ב-${affectedItemCount} מוצרים ולסמן מחירי לקוח לבדיקה.`
            : "לשמור את Markup ברירת המחדל?"
        }
        confirmLabel="שמירה"
        cancelLabel="ביטול"
        onConfirm={submitSave}
        onCancel={() => setConfirmOpen(false)}
        loading={isPending}
      />
    </section>
  );
}
