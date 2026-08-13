"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/app/admin/categories/actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type {
  AdminCategoryFormInput,
  CategoryFormState,
} from "@/types/admin-category";
import styles from "../ProductForm/form-section.module.scss";

type CategoryFormProps = {
  mode: "create" | "edit";
  initialCategory: AdminCategoryFormInput;
  categoryId?: string;
};

const initialState: CategoryFormState = {};

export default function CategoryForm({
  mode,
  initialCategory,
  categoryId,
}: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState(initialState);
  const [category, setCategory] = useState(initialCategory);
  const [isPending, startTransition] = useTransition();

  const updateField = <K extends keyof AdminCategoryFormInput>(
    key: K,
    value: AdminCategoryFormInput[K],
  ) => {
    setCategory((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    setFormState(initialState);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCategoryAction(category)
          : await updateCategoryAction(categoryId ?? "", category);

      setFormState(result);

      if (result.fieldErrors) {
        return;
      }

      if (result.error) {
        toast({ type: "error", message: result.error });
        return;
      }

      toast({ type: "success", message: "הקטגוריה נשמרה" });
      router.refresh();
    });
  };

  const fieldErrors = formState.fieldErrors ?? {};

  return (
    <div className={styles.stack}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>פרטי קטגוריה</h2>

        <div className={styles.fieldGrid}>
          <FormField
            label="שם בעברית"
            htmlFor="nameHe"
            error={fieldErrors.nameHe}
            errorId="nameHe-error"
          >
            <input
              id="nameHe"
              className={formFieldStyles.input}
              value={category.nameHe}
              onChange={(event) => updateField("nameHe", event.target.value)}
              aria-invalid={Boolean(fieldErrors.nameHe)}
              aria-describedby={fieldErrors.nameHe ? "nameHe-error" : undefined}
            />
          </FormField>

          <FormField
            label="שם באנגלית"
            htmlFor="nameEn"
            error={fieldErrors.nameEn}
            errorId="nameEn-error"
          >
            <input
              id="nameEn"
              className={formFieldStyles.input}
              value={category.nameEn}
              onChange={(event) => updateField("nameEn", event.target.value)}
              aria-invalid={Boolean(fieldErrors.nameEn)}
              aria-describedby={fieldErrors.nameEn ? "nameEn-error" : undefined}
            />
          </FormField>

          <FormField
            label="כתובת (slug)"
            htmlFor="slug"
            error={fieldErrors.slug}
            errorId="slug-error"
          >
            <input
              id="slug"
              className={formFieldStyles.input}
              dir="ltr"
              value={category.slug}
              onChange={(event) => updateField("slug", event.target.value)}
              aria-invalid={Boolean(fieldErrors.slug)}
              aria-describedby={fieldErrors.slug ? "slug-error" : undefined}
            />
          </FormField>

          <FormField
            label="סדר מיון"
            htmlFor="sortOrder"
            error={fieldErrors.sortOrder}
            errorId="sortOrder-error"
          >
            <input
              id="sortOrder"
              type="number"
              min={0}
              className={formFieldStyles.input}
              value={category.sortOrder}
              onChange={(event) => updateField("sortOrder", event.target.value)}
              aria-invalid={Boolean(fieldErrors.sortOrder)}
              aria-describedby={
                fieldErrors.sortOrder ? "sortOrder-error" : undefined
              }
            />
          </FormField>
        </div>

        <div className={styles.checkboxRow}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={category.isActive}
              onChange={(event) => updateField("isActive", event.target.checked)}
            />
            קטגוריה פעילה
          </label>
        </div>
      </section>

      <div className={styles.actions}>
        <Button
          onClick={handleSubmit}
          loading={isPending}
          loadingLabel="שמירה..."
        >
          שמירה
        </Button>
        <Button href="/admin/categories" variant="ghost">
          ביטול
        </Button>
      </div>
    </div>
  );
}
