"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  createProductAction,
  updateProductAction,
} from "@/app/admin/products/actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { AdminMaterialWithColors } from "@/lib/products/material-options/getActiveMaterialsWithColors";
import type {
  AdminProductFormInput,
  CategoryOption,
  ProductFormState,
} from "@/types/admin-product";
import MaterialOptionsEditor from "./MaterialOptionsEditor";
import MaterialsEditor from "./MaterialsEditor";
import ProductEditStickySave from "./ProductEditStickySave";
import { ProductFormActionsContext } from "./ProductFormActionsContext";
import ProductFormSection from "./ProductFormSection";
import SizesEditor from "./SizesEditor";
import styles from "./form-section.module.scss";

type ProductFormProps = {
  mode: "create" | "edit";
  categories: CategoryOption[];
  initialProduct: AdminProductFormInput;
  productId?: string;
  showSavedBanner?: boolean;
  activeMaterials: AdminMaterialWithColors[];
  assignedMaterials?: AdminMaterialWithColors[];
  children?: React.ReactNode;
};

const initialState: ProductFormState = {};

export default function ProductForm({
  mode,
  categories,
  initialProduct,
  productId,
  showSavedBanner = false,
  activeMaterials,
  assignedMaterials = [],
  children,
}: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState(initialState);
  const [product, setProduct] = useState(initialProduct);
  const [isPending, startTransition] = useTransition();
  const savedToastHandled = useRef(false);

  useEffect(() => {
    if (!showSavedBanner || savedToastHandled.current) {
      return;
    }

    savedToastHandled.current = true;
    toast({ type: "success", message: "המוצר נשמר" });
    router.replace(`/admin/products/${productId ?? ""}`, { scroll: false });
  }, [showSavedBanner, toast, router, productId]);

  const updateField = <K extends keyof AdminProductFormInput>(
    key: K,
    value: AdminProductFormInput[K],
  ) => {
    setProduct((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = useCallback(() => {
    setFormState(initialState);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProductAction(product)
          : await updateProductAction(productId ?? "", product);

      setFormState(result);

      if (result.fieldErrors) {
        return;
      }

      if (result.error) {
        toast({ type: "error", message: result.error });
        return;
      }

      if (result.success) {
        toast({ type: "success", message: "המוצר נשמר" });
        router.refresh();
      }
    });
  }, [mode, product, productId, router, toast]);

  const fieldErrors = formState.fieldErrors ?? {};

  const actionsContext = useMemo(
    () => ({ submit: handleSubmit, isPending }),
    [handleSubmit, isPending],
  );

  return (
    <ProductFormActionsContext.Provider value={actionsContext}>
      <div className={`${styles.stack}${mode === "edit" ? ` ${styles.stackEdit}` : ""}`}>
        <ProductFormSection
          id="product-identity"
          title="פרטי מוצר"
          description="זהות המוצר, סיווג וסטטוס פרסום."
        >
          <div className={styles.fieldGrid}>
            <FormField
              label="שם בעברית"
              htmlFor="nameHe"
              error={fieldErrors.nameHe}
            >
              <input
                id="nameHe"
                className={formFieldStyles.input}
                value={product.nameHe}
                onChange={(event) => updateField("nameHe", event.target.value)}
                aria-invalid={Boolean(fieldErrors.nameHe)}
              />
            </FormField>

            <FormField label="שם באנגלית" htmlFor="nameEn">
              <input
                id="nameEn"
                className={formFieldStyles.input}
                value={product.nameEn}
                onChange={(event) => updateField("nameEn", event.target.value)}
                dir="ltr"
              />
            </FormField>

            <FormField
              label="כתובת (slug)"
              htmlFor="slug"
              error={fieldErrors.slug}
              hint="לשימוש בכתובת המוצר באתר"
            >
              <input
                id="slug"
                className={formFieldStyles.input}
                value={product.slug}
                onChange={(event) => updateField("slug", event.target.value)}
                dir="ltr"
                aria-invalid={Boolean(fieldErrors.slug)}
              />
            </FormField>

            <FormField label='מק"ט' htmlFor="sku" error={fieldErrors.sku}>
              <input
                id="sku"
                className={formFieldStyles.input}
                value={product.sku}
                onChange={(event) => updateField("sku", event.target.value)}
                dir="ltr"
                aria-invalid={Boolean(fieldErrors.sku)}
              />
            </FormField>

            <FormField
              label="קטגוריה"
              htmlFor="categoryId"
              error={fieldErrors.categoryId}
              hint={
                mode === "edit"
                  ? "קטגוריה לא פעילה נשמרת אם כבר משויכת למוצר."
                  : undefined
              }
            >
              <select
                id="categoryId"
                className={formFieldStyles.select}
                value={product.categoryId}
                onChange={(event) =>
                  updateField("categoryId", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.categoryId)}
              >
                <option value="">בחרו קטגוריה</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.isActive === false
                      ? `${category.nameHe} (לא פעיל)`
                      : category.nameHe}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="מותג" htmlFor="brand">
              <input
                id="brand"
                className={formFieldStyles.input}
                value={product.brand}
                onChange={(event) => updateField("brand", event.target.value)}
              />
            </FormField>

            <FormField label="מעצב/ת" htmlFor="designer">
              <input
                id="designer"
                className={formFieldStyles.input}
                value={product.designer}
                onChange={(event) =>
                  updateField("designer", event.target.value)
                }
              />
            </FormField>
          </div>

          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={product.isActive}
                onChange={(event) =>
                  updateField("isActive", event.target.checked)
                }
              />
              מוצר פעיל — יוצג באתר הציבורי
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={product.isFeatured}
                onChange={(event) =>
                  updateField("isFeatured", event.target.checked)
                }
              />
              מוצר מומלץ — יסומן כמוצר מומלץ
            </label>
          </div>
        </ProductFormSection>

        <ProductFormSection
          id="product-content"
          title="תוכן"
          description="תיאורים לתצוגה בדף המוצר."
        >
          <div className={styles.fieldGrid}>
            <div className={`${styles.fieldGridItem} ${styles.fullWidth}`}>
              <FormField label="תיאור קצר" htmlFor="shortDescription">
              <textarea
                id="shortDescription"
                className={formFieldStyles.textarea}
                value={product.shortDescription}
                onChange={(event) =>
                  updateField("shortDescription", event.target.value)
                }
              />
            </FormField>
            </div>
            <div className={`${styles.fieldGridItem} ${styles.fullWidth}`}>
              <FormField label="תיאור מלא" htmlFor="longDescription">
              <textarea
                id="longDescription"
                className={formFieldStyles.textarea}
                value={product.longDescription}
                onChange={(event) =>
                  updateField("longDescription", event.target.value)
                }
              />
            </FormField>
            </div>
          </div>
        </ProductFormSection>

        <ProductFormSection
          id="product-config"
          title="תצורת מוצר"
          description="חומרים, צבעים ומידות לבחירה — משפיעים על הקונפיגורטור."
        >
          <MaterialOptionsEditor
            materialOptions={product.materialOptions}
            activeMaterials={activeMaterials}
            assignedMaterials={assignedMaterials}
            onChange={(materialOptions) =>
              updateField("materialOptions", materialOptions)
            }
            fieldErrors={fieldErrors}
          />
          <SizesEditor
            sizes={product.sizes}
            onChange={(sizes) => updateField("sizes", sizes)}
            fieldErrors={fieldErrors}
          />
        </ProductFormSection>

        <ProductFormSection
          id="product-spec"
          title="מידות ומפרט"
          description="מידות פיזיות ומפרט לתצוגה בדף המוצר."
        >
          <div className={styles.fieldGrid}>
            {(
              [
                ["width", "רוחב"],
                ["depth", "עומק"],
                ["height", "גובה"],
                ["seatHeight", "גובה מושב"],
              ] as const
            ).map(([field, label]) => (
              <FormField
                key={field}
                label={label}
                htmlFor={field}
                error={fieldErrors[field]}
              >
                <input
                  id={field}
                  className={formFieldStyles.input}
                  inputMode="decimal"
                  value={product[field]}
                  onChange={(event) => updateField(field, event.target.value)}
                  aria-invalid={Boolean(fieldErrors[field])}
                />
              </FormField>
            ))}
          </div>

          <MaterialsEditor
            materials={product.materials}
            onChange={(materials) => updateField("materials", materials)}
          />

          <div className={styles.fieldGrid}>
            <div className={`${styles.fieldGridItem} ${styles.fullWidth}`}>
              <FormField label="תחזוקה" htmlFor="maintenance">
                <textarea
                  id="maintenance"
                  className={formFieldStyles.textarea}
                  value={product.maintenance}
                  onChange={(event) =>
                    updateField("maintenance", event.target.value)
                  }
                />
              </FormField>
            </div>
            <div className={`${styles.fieldGridItem} ${styles.fullWidth}`}>
              <FormField label="אחריות" htmlFor="warranty">
                <textarea
                  id="warranty"
                  className={formFieldStyles.textarea}
                  value={product.warranty}
                  onChange={(event) =>
                    updateField("warranty", event.target.value)
                  }
                />
              </FormField>
            </div>
            <FormField label="ארץ מוצא" htmlFor="countryOfOrigin">
              <input
                id="countryOfOrigin"
                className={formFieldStyles.input}
                value={product.countryOfOrigin}
                onChange={(event) =>
                  updateField("countryOfOrigin", event.target.value)
                }
              />
            </FormField>
          </div>
        </ProductFormSection>

        {children}

        {mode === "create" ? (
          <div className={styles.actions}>
            <Button
              onClick={handleSubmit}
              loading={isPending}
              loadingLabel="שומר..."
            >
              יצירת מוצר
            </Button>
            <Link href="/admin/products" className={styles.cancelLink}>
              ביטול
            </Link>
          </div>
        ) : (
          <ProductEditStickySave />
        )}
      </div>
    </ProductFormActionsContext.Provider>
  );
}
