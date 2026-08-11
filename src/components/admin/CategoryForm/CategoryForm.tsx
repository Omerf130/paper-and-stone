"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/app/admin/categories/actions";
import type {
  AdminCategoryFormInput,
  CategoryFormState,
} from "@/types/admin-category";
import styles from "../ProductForm/form-section.module.scss";

type CategoryFormProps = {
  mode: "create" | "edit";
  initialCategory: AdminCategoryFormInput;
  categoryId?: string;
  showSavedBanner?: boolean;
};

const initialState: CategoryFormState = {};

export default function CategoryForm({
  mode,
  initialCategory,
  categoryId,
  showSavedBanner = false,
}: CategoryFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState(initialState);
  const [category, setCategory] = useState(initialCategory);
  const [isPending, startTransition] = useTransition();
  const [savedBanner, setSavedBanner] = useState(showSavedBanner);

  const updateField = <K extends keyof AdminCategoryFormInput>(
    key: K,
    value: AdminCategoryFormInput[K],
  ) => {
    setCategory((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    setSavedBanner(false);
    setFormState(initialState);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCategoryAction(category)
          : await updateCategoryAction(categoryId ?? "", category);

      setFormState(result);

      if (result.success) {
        setSavedBanner(true);
        router.refresh();
      }
    });
  };

  const fieldErrors = formState.fieldErrors ?? {};

  return (
    <div className={styles.stack}>
      {(savedBanner || showSavedBanner) && (
        <p className={styles.formSuccess} role="status">
          הקטגוריה נשמרה בהצלחה.
        </p>
      )}

      {formState.error && (
        <p className={styles.formError} role="alert">
          {formState.error}
        </p>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>פרטי קטגוריה</h2>

        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nameHe">
              שם בעברית
            </label>
            <input
              id="nameHe"
              className={styles.input}
              value={category.nameHe}
              onChange={(event) => updateField("nameHe", event.target.value)}
            />
            {fieldErrors.nameHe && (
              <p className={styles.fieldError}>{fieldErrors.nameHe}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="nameEn">
              שם באנגלית
            </label>
            <input
              id="nameEn"
              className={styles.input}
              value={category.nameEn}
              onChange={(event) => updateField("nameEn", event.target.value)}
            />
            {fieldErrors.nameEn && (
              <p className={styles.fieldError}>{fieldErrors.nameEn}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="slug">
              כתובת (slug)
            </label>
            <input
              id="slug"
              className={styles.input}
              dir="ltr"
              value={category.slug}
              onChange={(event) => updateField("slug", event.target.value)}
            />
            {fieldErrors.slug && (
              <p className={styles.fieldError}>{fieldErrors.slug}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="sortOrder">
              סדר מיון
            </label>
            <input
              id="sortOrder"
              type="number"
              min={0}
              className={styles.input}
              value={category.sortOrder}
              onChange={(event) => updateField("sortOrder", event.target.value)}
            />
            {fieldErrors.sortOrder && (
              <p className={styles.fieldError}>{fieldErrors.sortOrder}</p>
            )}
          </div>
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
        <button
          type="button"
          className={styles.submitButton}
          disabled={isPending}
          onClick={handleSubmit}
        >
          {isPending ? "שומר..." : "שמירה"}
        </button>
        <Link href="/admin/categories" className={styles.cancelLink}>
          ביטול
        </Link>
      </div>
    </div>
  );
}
