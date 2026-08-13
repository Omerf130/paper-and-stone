"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateCatalogPageContentAction } from "@/app/admin/content/catalog/actions";
import AdminDetailSection from "@/components/admin/project-detail/AdminDetailSection/AdminDetailSection";
import homepageStyles from "@/components/admin/homepage/homepage-editor.module.scss";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { CatalogPageContentFormInput } from "@/lib/cms/cms-validation";
import {
  mapCatalogPageContentViewToFormInput,
  type CatalogPageContentFormState,
} from "@/types/admin-catalog-page-content";
import type { CatalogPageContentView } from "@/types/cms-content";
import styles from "@/components/admin/ProductForm/form-section.module.scss";

type CatalogPageContentFormProps = {
  initialContent: CatalogPageContentView;
  documentExists: boolean;
};

const initialState: CatalogPageContentFormState = {};

export default function CatalogPageContentForm({
  initialContent,
  documentExists,
}: CatalogPageContentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState(initialState);
  const [form, setForm] = useState<CatalogPageContentFormInput>(() =>
    mapCatalogPageContentViewToFormInput(initialContent),
  );
  const [isPending, startTransition] = useTransition();

  const updateField = <K extends keyof CatalogPageContentFormInput>(
    key: K,
    value: CatalogPageContentFormInput[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    setFormState(initialState);

    startTransition(async () => {
      const result = await updateCatalogPageContentAction(form);

      if (result.fieldErrors) {
        setFormState({ fieldErrors: result.fieldErrors });
        toast({ type: "error", message: "נא לתקן את השדות המסומנים." });
        return;
      }

      if (result.error) {
        setFormState({ error: result.error });
        toast({ type: "error", message: result.error });
        return;
      }

      toast({ type: "success", message: "תוכן עמוד המוצרים נשמר." });
      router.refresh();
    });
  };

  return (
    <div className={styles.stack}>
      {!documentExists ? (
        <p className={homepageStyles.defaultBanner} role="status">
          התוכן הנוכחי מבוסס על ברירת המחדל. שמירה תעביר את עמוד המוצרים לניהול
          דרך המערכת.
        </p>
      ) : null}

      <AdminDetailSection id="catalog-hero" title="כותרת הקטלוג">
        <div className={styles.fieldGrid}>
          <FormField
            label="כותרת עליונה"
            htmlFor="catalog-eyebrow"
            error={formState.fieldErrors?.eyebrow}
          >
            <input
              id="catalog-eyebrow"
              className={formFieldStyles.input}
              value={form.eyebrow}
              onChange={(event) => updateField("eyebrow", event.target.value)}
            />
          </FormField>

          <FormField
            label="כותרת"
            htmlFor="catalog-heading"
            error={formState.fieldErrors?.heading}
          >
            <input
              id="catalog-heading"
              className={formFieldStyles.input}
              value={form.heading}
              onChange={(event) => updateField("heading", event.target.value)}
            />
          </FormField>

          <FormField
            label="טקסט תומך"
            htmlFor="catalog-supporting-text"
            error={formState.fieldErrors?.supportingText}
          >
            <textarea
              id="catalog-supporting-text"
              className={formFieldStyles.input}
              rows={3}
              value={form.supportingText}
              onChange={(event) => updateField("supportingText", event.target.value)}
            />
          </FormField>
        </div>
      </AdminDetailSection>

      <div className={styles.actions}>
        <Button type="button" onClick={handleSubmit} loading={isPending}>
          שמירה
        </Button>
        <Button href="/admin/content" variant="ghost">
          חזרה לתוכן
        </Button>
      </div>
    </div>
  );
}
