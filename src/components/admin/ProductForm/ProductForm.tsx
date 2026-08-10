"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createProductAction,
  updateProductAction,
} from "@/app/admin/products/actions";
import type {
  AdminProductFormInput,
  CategoryOption,
  ProductFormState,
} from "@/types/admin-product";
import FabricsEditor from "./FabricsEditor";
import MaterialsEditor from "./MaterialsEditor";
import SizesEditor from "./SizesEditor";
import styles from "./form-section.module.scss";

type ProductFormProps = {
  mode: "create" | "edit";
  categories: CategoryOption[];
  initialProduct: AdminProductFormInput;
  productId?: string;
  showSavedBanner?: boolean;
};

const initialState: ProductFormState = {};

export default function ProductForm({
  mode,
  categories,
  initialProduct,
  productId,
  showSavedBanner = false,
}: ProductFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState(initialState);
  const [product, setProduct] = useState(initialProduct);
  const [isPending, startTransition] = useTransition();
  const [savedBanner, setSavedBanner] = useState(showSavedBanner);

  const updateField = <K extends keyof AdminProductFormInput>(
    key: K,
    value: AdminProductFormInput[K],
  ) => {
    setProduct((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    setSavedBanner(false);
    setFormState(initialState);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProductAction(product)
          : await updateProductAction(productId ?? "", product);

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
          המוצר נשמר בהצלחה.
        </p>
      )}

      {formState.error && (
        <p className={styles.formError} role="alert">
          {formState.error}
        </p>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>מידע בסיסי</h2>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nameHe">
              שם בעברית
            </label>
            <input
              id="nameHe"
              className={styles.input}
              value={product.nameHe}
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
              value={product.nameEn}
              onChange={(event) => updateField("nameEn", event.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="slug">
              כתובת (slug)
            </label>
            <input
              id="slug"
              className={styles.input}
              value={product.slug}
              onChange={(event) => updateField("slug", event.target.value)}
            />
            {fieldErrors.slug && (
              <p className={styles.fieldError}>{fieldErrors.slug}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="sku">
              מק״ט
            </label>
            <input
              id="sku"
              className={styles.input}
              value={product.sku}
              onChange={(event) => updateField("sku", event.target.value)}
            />
            {fieldErrors.sku && (
              <p className={styles.fieldError}>{fieldErrors.sku}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="categoryId">
              קטגוריה
            </label>
            <select
              id="categoryId"
              className={styles.select}
              value={product.categoryId}
              onChange={(event) =>
                updateField("categoryId", event.target.value)
              }
            >
              <option value="">בחרו קטגוריה</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nameHe}
                </option>
              ))}
            </select>
            {fieldErrors.categoryId && (
              <p className={styles.fieldError}>{fieldErrors.categoryId}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="brand">
              מותג
            </label>
            <input
              id="brand"
              className={styles.input}
              value={product.brand}
              onChange={(event) => updateField("brand", event.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="designer">
              מעצב/ת
            </label>
            <input
              id="designer"
              className={styles.input}
              value={product.designer}
              onChange={(event) => updateField("designer", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>תוכן</h2>
        <div className={styles.fieldGrid}>
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label className={styles.label} htmlFor="shortDescription">
              תיאור קצר
            </label>
            <textarea
              id="shortDescription"
              className={styles.textarea}
              value={product.shortDescription}
              onChange={(event) =>
                updateField("shortDescription", event.target.value)
              }
            />
          </div>
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label className={styles.label} htmlFor="longDescription">
              תיאור מלא
            </label>
            <textarea
              id="longDescription"
              className={styles.textarea}
              value={product.longDescription}
              onChange={(event) =>
                updateField("longDescription", event.target.value)
              }
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>מידות</h2>
        <div className={styles.fieldGrid}>
          {(
            [
              ["width", "רוחב"],
              ["depth", "עומק"],
              ["height", "גובה"],
              ["seatHeight", "גובה מושב"],
            ] as const
          ).map(([field, label]) => (
            <div className={styles.field} key={field}>
              <label className={styles.label} htmlFor={field}>
                {label}
              </label>
              <input
                id={field}
                className={styles.input}
                inputMode="decimal"
                value={product[field]}
                onChange={(event) => updateField(field, event.target.value)}
              />
              {fieldErrors[field] && (
                <p className={styles.fieldError}>{fieldErrors[field]}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>מידע טכני</h2>
        <div className={styles.stack}>
          <MaterialsEditor
            materials={product.materials}
            onChange={(materials) => updateField("materials", materials)}
          />
          <div className={styles.fieldGrid}>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label} htmlFor="maintenance">
                תחזוקה
              </label>
              <textarea
                id="maintenance"
                className={styles.textarea}
                value={product.maintenance}
                onChange={(event) =>
                  updateField("maintenance", event.target.value)
                }
              />
            </div>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label} htmlFor="warranty">
                אחריות
              </label>
              <textarea
                id="warranty"
                className={styles.textarea}
                value={product.warranty}
                onChange={(event) =>
                  updateField("warranty", event.target.value)
                }
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="countryOfOrigin">
                ארץ מוצא
              </label>
              <input
                id="countryOfOrigin"
                className={styles.input}
                value={product.countryOfOrigin}
                onChange={(event) =>
                  updateField("countryOfOrigin", event.target.value)
                }
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>בדים וצבעים</h2>
        <FabricsEditor
          fabrics={product.fabrics}
          onChange={(fabrics) => updateField("fabrics", fabrics)}
          fieldErrors={fieldErrors}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>מידות לבחירה</h2>
        <SizesEditor
          sizes={product.sizes}
          onChange={(sizes) => updateField("sizes", sizes)}
          fieldErrors={fieldErrors}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>סטטוס</h2>
        <div className={styles.checkboxRow}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={product.isActive}
              onChange={(event) => updateField("isActive", event.target.checked)}
            />
            מוצר פעיל
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={product.isFeatured}
              onChange={(event) =>
                updateField("isFeatured", event.target.checked)
              }
            />
            מוצר מומלץ
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
          {isPending ? "שומר..." : mode === "create" ? "יצירת מוצר" : "שמירה"}
        </button>
        <Link href="/admin/products" className={styles.cancelLink}>
          ביטול
        </Link>
      </div>
    </div>
  );
}
