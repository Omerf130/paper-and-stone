"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  fetchUnlinkedProductsAction,
  linkMaterialProductAction,
  unlinkMaterialProductAction,
} from "@/app/admin/materials/product-link-actions";
import Button from "@/components/ui/Button/Button";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type {
  AdminMaterialProductLink,
} from "@/types/admin-material";
import type { MaterialVariantInput } from "@/types/material-variant";
import styles from "../ProductForm/form-section.module.scss";

type MaterialProductLinksEditorProps = {
  materialId: string;
  variants: MaterialVariantInput[];
  initialLinks: AdminMaterialProductLink[];
};

type ProductOption = {
  id: string;
  nameHe: string;
  sku: string;
};

export default function MaterialProductLinksEditor({
  materialId,
  variants,
  initialLinks,
}: MaterialProductLinksEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [links, setLinks] = useState(initialLinks);
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);

  const activeVariants = variants.filter((variant) => variant.isActive);

  const openAddPanel = () => {
    startTransition(async () => {
      const products = await fetchUnlinkedProductsAction(materialId);
      setProductOptions(products);
      setShowAdd(true);
    });
  };

  const handleLink = () => {
    if (!selectedProductId || selectedVariantIds.length === 0) {
      toast({ type: "error", message: "יש לבחור מוצר ולפחות variant אחד" });
      return;
    }

    startTransition(async () => {
      const result = await linkMaterialProductAction(
        materialId,
        selectedProductId,
        selectedVariantIds,
      );

      if ("error" in result) {
        toast({ type: "error", message: result.error });
        return;
      }

      const product = productOptions.find(
        (option) => option.id === selectedProductId,
      );

      if (product) {
        setLinks((current) => [
          ...current.filter((link) => link.productId !== selectedProductId),
          {
            productId: selectedProductId,
            nameHe: product.nameHe,
            sku: product.sku,
            allowedVariantIds: selectedVariantIds,
          },
        ]);
      }

      setShowAdd(false);
      setSelectedProductId("");
      setSelectedVariantIds([]);
      toast({ type: "success", message: "המוצר קושר לחומר" });
      router.refresh();
    });
  };

  const handleUnlink = (productId: string) => {
    startTransition(async () => {
      const result = await unlinkMaterialProductAction(materialId, productId);

      if ("error" in result) {
        toast({ type: "error", message: result.error });
        return;
      }

      setLinks((current) =>
        current.filter((link) => link.productId !== productId),
      );
      toast({ type: "success", message: "הקישור הוסר" });
      router.refresh();
    });
  };

  return (
    <div className={styles.stack}>
      <div className={styles.subsectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>מוצרים המשתמשים בחומר</h2>
          <p className={styles.helperText}>
            ניהול קשרי Material/Product. שינויים כאן משקפים גם את טופס המוצר.
          </p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={openAddPanel}>
          הוספת מוצר
        </Button>
      </div>

      {links.length === 0 ? (
        <p className={styles.helperText}>אין מוצרים המשויכים לחומר זה.</p>
      ) : (
        <ul className={styles.stack}>
          {links.map((link) => (
            <li key={link.productId} className={styles.materialBlock}>
              <div className={styles.materialHeader}>
                <div>
                  <p className={styles.materialTitle}>
                    <Link href={`/admin/products/${link.productId}`}>
                      {link.nameHe}
                    </Link>
                  </p>
                  <p className={styles.materialMeta}>
                    SKU: {link.sku} · {link.allowedVariantIds.length} variants
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  loading={isPending}
                  onClick={() => handleUnlink(link.productId)}
                >
                  הסרת קישור
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showAdd ? (
        <div className={styles.materialBlock}>
          <FormAddProduct
            productOptions={productOptions}
            activeVariants={activeVariants}
            selectedProductId={selectedProductId}
            selectedVariantIds={selectedVariantIds}
            onProductChange={setSelectedProductId}
            onVariantToggle={(variantId, checked) => {
              setSelectedVariantIds((current) =>
                checked
                  ? [...current, variantId]
                  : current.filter((id) => id !== variantId),
              );
            }}
            onCancel={() => setShowAdd(false)}
            onSubmit={handleLink}
            isPending={isPending}
          />
        </div>
      ) : null}
    </div>
  );
}

type FormAddProductProps = {
  productOptions: ProductOption[];
  activeVariants: MaterialVariantInput[];
  selectedProductId: string;
  selectedVariantIds: string[];
  onProductChange: (productId: string) => void;
  onVariantToggle: (variantId: string, checked: boolean) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isPending: boolean;
};

function FormAddProduct({
  productOptions,
  activeVariants,
  selectedProductId,
  selectedVariantIds,
  onProductChange,
  onVariantToggle,
  onCancel,
  onSubmit,
  isPending,
}: FormAddProductProps) {
  return (
    <div className={styles.stack}>
      <label className={styles.label} htmlFor="link-product">
        בחרו מוצר
      </label>
      <select
        id="link-product"
        className={styles.select}
        value={selectedProductId}
        onChange={(event) => onProductChange(event.target.value)}
      >
        <option value="">—</option>
        {productOptions.map((product) => (
          <option key={product.id} value={product.id}>
            {product.nameHe} ({product.sku})
          </option>
        ))}
      </select>

      <p className={styles.subheading}>Variants מותרים</p>
      <ul className={styles.colorGrid}>
        {activeVariants.map((variant) => {
          const variantId = variant.id ?? "";
          if (!variantId) {
            return null;
          }

          return (
            <li key={variantId}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedVariantIds.includes(variantId)}
                  onChange={(event) =>
                    onVariantToggle(variantId, event.target.checked)
                  }
                />
                {variant.name}
              </label>
            </li>
          );
        })}
      </ul>

      <div className={styles.actions}>
        <Button type="button" size="sm" loading={isPending} onClick={onSubmit}>
          קישור
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          ביטול
        </Button>
      </div>
    </div>
  );
}
