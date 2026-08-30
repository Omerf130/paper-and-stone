"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  createCategoryInlineAction,
  createProductAction,
  createSupplierInlineAction,
  updateProductAction,
} from "@/app/admin/products/actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import Tabs from "@/components/ui/Tabs/Tabs";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { AdminMaterialWithColors } from "@/lib/products/material-options/getActiveMaterialsWithColors";
import {
  getTabsWithErrors,
  PRODUCT_FORM_TAB_LABELS,
  PRODUCT_FORM_TAB_ORDER,
  resolveFirstTabWithErrors,
  type ProductFormTabId,
} from "@/lib/products/product-form-tabs";
import type {
  AdminProductFormInput,
  CategoryOption,
  ProductFormState,
} from "@/types/admin-product";
import type { SupplierOption } from "@/types/admin-supplier";
import MaterialOptionsEditor from "./MaterialOptionsEditor";
import MaterialsEditor from "./MaterialsEditor";
import DocumentsEditor from "./DocumentsEditor";
import ProductEditStickySave from "./ProductEditStickySave";
import { ProductFormActionsContext } from "./ProductFormActionsContext";
import SizesEditor from "./SizesEditor";
import styles from "./form-section.module.scss";

type ProductFormProps = {
  mode: "create" | "edit";
  categories: CategoryOption[];
  supplierOptions: SupplierOption[];
  initialProduct: AdminProductFormInput;
  productId?: string;
  showSavedBanner?: boolean;
  activeMaterials: AdminMaterialWithColors[];
  assignedMaterials?: AdminMaterialWithColors[];
  children?: React.ReactNode;
};

const initialState: ProductFormState = {};

const CREATE_CATEGORY_VALUE = "__create_category__";
const CREATE_SUPPLIER_VALUE = "__create_supplier__";

export default function ProductForm({
  mode,
  categories,
  supplierOptions,
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
  const [categoryOptions, setCategoryOptions] = useState(categories);
  const [localSupplierOptions, setLocalSupplierOptions] =
    useState(supplierOptions);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierCode, setNewSupplierCode] = useState("");
  const [activeTabId, setActiveTabId] = useState<ProductFormTabId>("general");
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

  const handleCreateCategory = () => {
    startTransition(async () => {
      const result = await createCategoryInlineAction(newCategoryName);

      if ("error" in result) {
        toast({ type: "error", message: result.error });
        return;
      }

      setCategoryOptions((current) => [
        ...current,
        { id: result.categoryId, nameHe: result.nameHe, isActive: true },
      ]);
      updateField("categoryId", result.categoryId);
      setShowNewCategory(false);
      setNewCategoryName("");
      toast({ type: "success", message: "הקטגוריה נוצרה" });
    });
  };

  const handleCreateSupplier = () => {
    startTransition(async () => {
      const result = await createSupplierInlineAction({
        name: newSupplierName,
        code: newSupplierCode,
        isActive: true,
      });

      if ("error" in result) {
        const message =
          result.fieldErrors?.name ??
          result.fieldErrors?.code ??
          result.error;
        toast({ type: "error", message });
        return;
      }

      setLocalSupplierOptions((current) => [
        ...current,
        { id: result.supplierId, name: result.name, isActive: true },
      ]);
      updateField("supplierId", result.supplierId);
      setShowNewSupplier(false);
      setNewSupplierName("");
      setNewSupplierCode("");
      toast({ type: "success", message: "הספק נוצר" });
    });
  };

  const handleCategorySelectChange = (value: string) => {
    if (value === CREATE_CATEGORY_VALUE) {
      setShowNewCategory(true);
      return;
    }

    setShowNewCategory(false);
    updateField("categoryId", value);
  };

  const handleSupplierSelectChange = (value: string) => {
    if (value === CREATE_SUPPLIER_VALUE) {
      setShowNewSupplier(true);
      return;
    }

    setShowNewSupplier(false);
    updateField("supplierId", value);
  };

  const categorySelectValue = showNewCategory
    ? CREATE_CATEGORY_VALUE
    : product.categoryId;

  const supplierSelectValue = showNewSupplier
    ? CREATE_SUPPLIER_VALUE
    : product.supplierId;

  const handleSubmit = useCallback(() => {
    setFormState(initialState);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProductAction(product)
          : await updateProductAction(productId ?? "", product);

      setFormState(result);

      if (result.fieldErrors) {
        const errorTab = resolveFirstTabWithErrors(result.fieldErrors);
        if (errorTab) {
          setActiveTabId(errorTab);
          toast({
            type: "error",
            message: `יש לתקן שדות בלשונית "${PRODUCT_FORM_TAB_LABELS[errorTab]}".`,
          });
        }
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
  const tabsWithErrors = getTabsWithErrors(fieldErrors);

  const actionsContext = useMemo(
    () => ({ submit: handleSubmit, isPending }),
    [handleSubmit, isPending],
  );

  const generalPanel = (
    <div className={styles.tabPanel}>
      <div className={styles.fieldGrid}>
        <FormField label="שם בעברית" htmlFor="nameHe" error={fieldErrors.nameHe}>
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

        <FormField label="קוד מוצר" htmlFor="sku" error={fieldErrors.sku}>
          <input
            id="sku"
            className={formFieldStyles.input}
            value={product.sku}
            onChange={(event) => updateField("sku", event.target.value)}
            dir="ltr"
            aria-invalid={Boolean(fieldErrors.sku)}
          />
        </FormField>

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
            onChange={(event) => updateField("designer", event.target.value)}
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
            value={categorySelectValue}
            onChange={(event) => handleCategorySelectChange(event.target.value)}
            aria-invalid={Boolean(fieldErrors.categoryId)}
          >
            <option value="">בחרו קטגוריה</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.isActive === false
                  ? `${category.nameHe} (לא פעיל)`
                  : category.nameHe}
              </option>
            ))}
            <option value={CREATE_CATEGORY_VALUE}>+ קטגוריה חדשה</option>
          </select>
        </FormField>

        {showNewCategory ? (
          <div className={`${styles.fieldGridItem} ${styles.fullWidth}`}>
            <div className={styles.inlineCreatePanel}>
              <p className={styles.subheading}>קטגוריה חדשה</p>
              <div className={styles.inlineCreateFields}>
                <FormField label="שם קטגוריה" htmlFor="new-category-name">
                  <input
                    id="new-category-name"
                    className={formFieldStyles.input}
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                  />
                </FormField>
              </div>
              <div className={styles.inlineCreateActions}>
                <Button
                  type="button"
                  size="sm"
                  loading={isPending}
                  onClick={handleCreateCategory}
                >
                  יצירת קטגוריה
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategoryName("");
                  }}
                >
                  ביטול
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <FormField
          label="ספק"
          htmlFor="supplierId"
          error={fieldErrors.supplierId}
          hint="חובה לכל מוצר חדש ולשמירת מוצר קיים"
        >
          <select
            id="supplierId"
            className={formFieldStyles.select}
            value={supplierSelectValue}
            onChange={(event) => handleSupplierSelectChange(event.target.value)}
            aria-invalid={Boolean(fieldErrors.supplierId)}
          >
            <option value="">בחרו ספק</option>
            {localSupplierOptions.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.isActive === false
                  ? `${supplier.name} (לא פעיל)`
                  : supplier.name}
              </option>
            ))}
            <option value={CREATE_SUPPLIER_VALUE}>+ ספק חדש</option>
          </select>
        </FormField>

        {showNewSupplier ? (
          <div className={`${styles.fieldGridItem} ${styles.fullWidth}`}>
            <div className={styles.inlineCreatePanel}>
              <p className={styles.subheading}>ספק חדש</p>
              <div className={styles.inlineCreateFields}>
                <FormField label="שם ספק" htmlFor="new-supplier-name">
                  <input
                    id="new-supplier-name"
                    className={formFieldStyles.input}
                    value={newSupplierName}
                    onChange={(event) => setNewSupplierName(event.target.value)}
                  />
                </FormField>
                <FormField label="קוד (אופציונלי)" htmlFor="new-supplier-code">
                  <input
                    id="new-supplier-code"
                    className={formFieldStyles.input}
                    dir="ltr"
                    value={newSupplierCode}
                    onChange={(event) => setNewSupplierCode(event.target.value)}
                  />
                </FormField>
              </div>
              <div className={styles.inlineCreateActions}>
                <Button
                  type="button"
                  size="sm"
                  loading={isPending}
                  onClick={handleCreateSupplier}
                >
                  יצירת ספק
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowNewSupplier(false);
                    setNewSupplierName("");
                    setNewSupplierCode("");
                  }}
                >
                  ביטול
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <div className={`${styles.fieldGridItem} ${styles.fullWidth}`}>
          <div className={styles.internalFieldsGroup}>
            <p className={styles.subheading}>מידע קטלוג פנימי (Admin בלבד)</p>
            <div className={styles.fieldGrid}>
              <FormField
                label="Internal Catalog Name"
                htmlFor="internalCatalogName"
                error={fieldErrors.internalCatalogName}
              >
                <input
                  id="internalCatalogName"
                  className={formFieldStyles.input}
                  dir="ltr"
                  value={product.internalCatalogName}
                  onChange={(event) =>
                    updateField("internalCatalogName", event.target.value)
                  }
                />
              </FormField>
              <FormField
                label="Catalog Code"
                htmlFor="catalogCode"
                error={fieldErrors.catalogCode}
              >
                <input
                  id="catalogCode"
                  className={formFieldStyles.input}
                  dir="ltr"
                  value={product.catalogCode}
                  onChange={(event) =>
                    updateField("catalogCode", event.target.value)
                  }
                />
              </FormField>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.visibilityGroup}>
        <p className={styles.subheading}>נראות מוצר</p>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={product.isActive}
            onChange={(event) => updateField("isActive", event.target.checked)}
          />
          {product.isActive
            ? "גלוי — מוצג בקטלוג הציבורי וב-PDP"
            : "מוסתר — זמין ב-Admin בלבד, לא בקטלוג או PDP"}
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
    </div>
  );

  const mediaPanel =
    mode === "edit" && children ? (
      <div className={styles.tabPanel}>{children}</div>
    ) : (
      <div className={styles.tabPanel}>
        <p className={styles.helperText}>
          {mode === "create"
            ? "לאחר שמירת המוצר ניתן להוסיף תמונות, גלריה, שרטוטים וצביעה אוטומטית."
            : "אין עדיין מדיה למוצר זה."}
        </p>
      </div>
    );

  const materialsPanel = (
    <div className={styles.tabPanel}>
      <MaterialOptionsEditor
        materialOptions={product.materialOptions}
        activeMaterials={activeMaterials}
        assignedMaterials={assignedMaterials}
        onChange={(materialOptions) => updateField("materialOptions", materialOptions)}
        fieldErrors={fieldErrors}
      />
      <SizesEditor
        sizes={product.sizes}
        onChange={(sizes) => updateField("sizes", sizes)}
        fieldErrors={fieldErrors}
      />
    </div>
  );

  const technicalPanel = (
    <div className={styles.tabPanel}>
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
              onChange={(event) => updateField("maintenance", event.target.value)}
            />
          </FormField>
        </div>
        <div className={`${styles.fieldGridItem} ${styles.fullWidth}`}>
          <FormField label="אחריות" htmlFor="warranty">
            <textarea
              id="warranty"
              className={formFieldStyles.textarea}
              value={product.warranty}
              onChange={(event) => updateField("warranty", event.target.value)}
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

      <DocumentsEditor
        documents={product.documents}
        onChange={(documents) => updateField("documents", documents)}
        fieldErrors={fieldErrors}
      />
    </div>
  );

  const pricingPanel = (
    <div className={styles.tabPanel}>
      <div className={styles.fieldGrid}>
        <FormField
          label="עלות פנימית ברירת מחדל"
          htmlFor="defaultInternalCostShekels"
          error={fieldErrors.defaultInternalCostShekels}
          hint="שדה פנימי לשימוש Admin בלבד"
        >
          <input
            id="defaultInternalCostShekels"
            type="text"
            inputMode="decimal"
            dir="ltr"
            className={formFieldStyles.input}
            value={product.defaultInternalCostShekels}
            onChange={(event) =>
              updateField("defaultInternalCostShekels", event.target.value)
            }
            disabled={isPending}
            placeholder="1000"
            aria-invalid={Boolean(fieldErrors.defaultInternalCostShekels)}
          />
        </FormField>
      </div>
    </div>
  );

  const tabPanels: Record<ProductFormTabId, React.ReactNode> = {
    general: generalPanel,
    media: mediaPanel,
    materials: materialsPanel,
    technical: technicalPanel,
    pricing: pricingPanel,
  };

  const tabItems = PRODUCT_FORM_TAB_ORDER.map((tabId) => ({
    id: tabId,
    label: PRODUCT_FORM_TAB_LABELS[tabId],
    panel: tabPanels[tabId],
    hasError: tabsWithErrors.has(tabId),
  }));

  return (
    <ProductFormActionsContext.Provider value={actionsContext}>
      <div className={`${styles.stack}${mode === "edit" ? ` ${styles.stackEdit}` : ""}`}>
        <Tabs
          items={tabItems}
          activeTabId={activeTabId}
          onTabChange={(tabId) => setActiveTabId(tabId as ProductFormTabId)}
          ariaLabel="עריכת מוצר"
        />

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
