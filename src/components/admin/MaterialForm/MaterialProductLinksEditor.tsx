"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  fetchUnlinkedProductsAction,
  linkMaterialProductAction,
  unlinkMaterialProductAction,
} from "@/app/admin/materials/product-link-actions";
import cardStyles from "@/components/admin/list/admin-list-card.module.scss";
import layoutStyles from "@/components/admin/list/admin-list-layout.module.scss";
import tableStyles from "@/components/admin/list/admin-table.module.scss";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { mapEntityActiveToBadge } from "@/lib/ui/map-status-badge";
import type { AdminMaterialProductLink } from "@/types/admin-material";
import type { MaterialVariantInput } from "@/types/material-variant";
import formStyles from "../ProductForm/form-section.module.scss";
import styles from "./MaterialProductLinksEditor.module.scss";

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

type PanelMode =
  | { type: "add" }
  | { type: "edit"; productId: string; allowedVariantIds: string[] }
  | null;

function getPersistedActiveVariants(variants: MaterialVariantInput[]) {
  return variants.filter((variant) => variant.isActive && variant.id);
}

function formatVariantNames(
  allowedVariantIds: string[],
  variants: MaterialVariantInput[],
): string {
  if (allowedVariantIds.length === 0) {
    return "—";
  }

  const names = allowedVariantIds
    .map((variantId) => variants.find((variant) => variant.id === variantId)?.name)
    .filter(Boolean);

  return names.length > 0 ? names.join(", ") : `${allowedVariantIds.length} variants`;
}

export default function MaterialProductLinksEditor({
  materialId,
  variants,
  initialLinks,
}: MaterialProductLinksEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [links, setLinks] = useState(initialLinks);
  const [isPending, startTransition] = useTransition();
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [unlinkTarget, setUnlinkTarget] = useState<AdminMaterialProductLink | null>(
    null,
  );

  const persistedActiveVariants = getPersistedActiveVariants(variants);

  const loadUnlinkedProducts = (query: string) => {
    startTransition(async () => {
      const products = await fetchUnlinkedProductsAction(materialId, query);
      setProductOptions(products);
    });
  };

  const openAddPanel = () => {
    setPanelMode({ type: "add" });
    setSearchQuery("");
    setSelectedProductId("");
    setSelectedVariantIds([]);
    loadUnlinkedProducts("");
  };

  const openEditPanel = (link: AdminMaterialProductLink) => {
    setPanelMode({
      type: "edit",
      productId: link.productId,
      allowedVariantIds: link.allowedVariantIds,
    });
    setSelectedProductId(link.productId);
    setSelectedVariantIds(link.allowedVariantIds);
    setProductOptions([]);
    setSearchQuery("");
  };

  const closePanel = () => {
    setPanelMode(null);
    setSelectedProductId("");
    setSelectedVariantIds([]);
    setProductOptions([]);
    setSearchQuery("");
  };

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    setSelectedVariantIds([]);
  };

  const handleVariantToggle = (variantId: string, checked: boolean) => {
    setSelectedVariantIds((current) =>
      checked ? [...current, variantId] : current.filter((id) => id !== variantId),
    );
  };

  const handleSaveLink = () => {
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

      const existingLink = links.find((link) => link.productId === selectedProductId);
      const selectedProduct = productOptions.find(
        (option) => option.id === selectedProductId,
      );

      if (existingLink) {
        setLinks((current) =>
          current.map((link) =>
            link.productId === selectedProductId
              ? { ...link, allowedVariantIds: selectedVariantIds }
              : link,
          ),
        );
      } else if (selectedProduct) {
        setLinks((current) => [
          ...current,
          {
            productId: selectedProductId,
            nameHe: selectedProduct.nameHe,
            sku: selectedProduct.sku,
            allowedVariantIds: selectedVariantIds,
            isActive: true,
          },
        ]);
      }

      toast({
        type: "success",
        message:
          panelMode?.type === "edit"
            ? "אפשרויות המוצר עודכנו"
            : "המוצר קושר לחומר",
      });
      closePanel();
      router.refresh();
    });
  };

  const confirmUnlink = () => {
    if (!unlinkTarget) {
      return;
    }

    const productId = unlinkTarget.productId;

    startTransition(async () => {
      const result = await unlinkMaterialProductAction(materialId, productId);

      if ("error" in result) {
        toast({ type: "error", message: result.error });
        setUnlinkTarget(null);
        return;
      }

      setLinks((current) => current.filter((link) => link.productId !== productId));
      toast({ type: "success", message: "המוצר הוסר מהחומר" });
      setUnlinkTarget(null);
      router.refresh();
    });
  };

  const panelTitle = useMemo(() => {
    if (panelMode?.type === "edit") {
      const link = links.find((entry) => entry.productId === panelMode.productId);
      return link ? `עריכת אפשרויות — ${link.nameHe}` : "עריכת אפשרויות";
    }

    return "הוספת מוצר לחומר";
  }, [links, panelMode]);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>ספריית מוצרים</h2>
          <p className={styles.description}>
            מוצרים שמשתמשים בחומר זה. ניתן לקשר מוצר קיים, לערוך variants מותרים,
            או להסיר את הקשר — המוצר עצמו לא נמחק.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={Boolean(panelMode)}
          onClick={openAddPanel}
        >
          + הוספת מוצר
        </Button>
      </div>

      {links.length === 0 ? (
        <EmptyState
          title="אין מוצרים המשויכים לחומר זה"
          description="קשרו מוצר קיים כדי לאפשר בחירת variants של חומר זה במוצר."
          action={
            <Button type="button" size="sm" onClick={openAddPanel}>
              + הוספת מוצר
            </Button>
          }
        />
      ) : (
        <>
          <div className={layoutStyles.desktopOnlyDesktop}>
            <div className={tableStyles.wrap}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th scope="col">תמונה</th>
                    <th scope="col">מוצר</th>
                    <th scope="col">מק״ט</th>
                    <th scope="col">קטגוריה</th>
                    <th scope="col">סטטוס</th>
                    <th scope="col">Variants מותרים</th>
                    <th scope="col">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => {
                    const activeStatus = mapEntityActiveToBadge(link.isActive);

                    return (
                      <tr key={link.productId}>
                        <td>
                          {link.thumbnailUrl ? (
                            <img
                              src={link.thumbnailUrl}
                              alt=""
                              className={styles.thumbnail}
                            />
                          ) : (
                            <span className={styles.thumbnailPlaceholder} aria-hidden="true">
                              —
                            </span>
                          )}
                        </td>
                        <td className={tableStyles.primary}>
                          <Link href={`/admin/products/${link.productId}`}>
                            {link.nameHe}
                          </Link>
                        </td>
                        <td dir="ltr">{link.sku}</td>
                        <td>{link.categoryName ?? "—"}</td>
                        <td>
                          <StatusBadge tone={activeStatus.tone}>
                            {activeStatus.label}
                          </StatusBadge>
                        </td>
                        <td>{formatVariantNames(link.allowedVariantIds, variants)}</td>
                        <td className={tableStyles.actions}>
                          <div className={styles.rowActions}>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              disabled={isPending}
                              onClick={() => openEditPanel(link)}
                            >
                              עריכת אפשרויות
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={isPending}
                              onClick={() => setUnlinkTarget(link)}
                            >
                              הסרה מהחומר
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <ul className={`${layoutStyles.mobileOnlyDesktop} ${cardStyles.list}`}>
            {links.map((link) => {
              const activeStatus = mapEntityActiveToBadge(link.isActive);

              return (
                <li key={link.productId} className={cardStyles.card}>
                  <div className={cardStyles.header}>
                    <p className={cardStyles.title}>
                      <Link href={`/admin/products/${link.productId}`}>
                        {link.nameHe}
                      </Link>
                    </p>
                    <p className={cardStyles.subtitle} dir="ltr">
                      {link.sku}
                    </p>
                  </div>

                  <div className={cardStyles.badges}>
                    <StatusBadge tone={activeStatus.tone}>
                      {activeStatus.label}
                    </StatusBadge>
                  </div>

                  <div className={cardStyles.metaGrid}>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>קטגוריה:</span>
                      <span className={cardStyles.metaValue}>
                        {link.categoryName ?? "—"}
                      </span>
                    </div>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>Variants:</span>
                      <span className={cardStyles.metaValue}>
                        {formatVariantNames(link.allowedVariantIds, variants)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={isPending}
                      onClick={() => openEditPanel(link)}
                    >
                      עריכת אפשרויות
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      onClick={() => setUnlinkTarget(link)}
                    >
                      הסרה מהחומר
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {panelMode ? (
        <div className={styles.panel}>
          <h3 className={styles.title}>{panelTitle}</h3>

          {panelMode.type === "add" ? (
            <>
              <div className={styles.searchRow}>
                <div className={styles.searchField}>
                  <label className={styles.searchLabel} htmlFor="link-product-search">
                    חיפוש מוצר
                  </label>
                  <input
                    id="link-product-search"
                    type="search"
                    className={styles.searchInput}
                    value={searchQuery}
                    placeholder="שם או מק״ט..."
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  loading={isPending}
                  onClick={() => loadUnlinkedProducts(searchQuery)}
                >
                  חיפוש
                </Button>
              </div>

              {productOptions.length === 0 ? (
                <p className={styles.description}>
                  {isPending
                    ? "טוען מוצרים..."
                    : "אין מוצרים זמינים לקישור. נסו חיפוש אחר."}
                </p>
              ) : (
                <div className={styles.searchField}>
                  <label className={styles.searchLabel} htmlFor="link-product">
                    בחרו מוצר
                  </label>
                  <select
                    id="link-product"
                    className={styles.productSelect}
                    value={selectedProductId}
                    onChange={(event) => handleProductChange(event.target.value)}
                  >
                    <option value="">—</option>
                    {productOptions.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.nameHe} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          ) : null}

          <VariantPicker
            variants={persistedActiveVariants}
            selectedVariantIds={selectedVariantIds}
            onToggle={handleVariantToggle}
          />

          <div className={styles.panelActions}>
            <Button
              type="button"
              size="sm"
              loading={isPending}
              onClick={handleSaveLink}
            >
              {panelMode.type === "edit" ? "שמירת אפשרויות" : "קישור מוצר"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={closePanel}>
              ביטול
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={unlinkTarget !== null}
        title="הסרת המוצר מהחומר"
        description={
          unlinkTarget
            ? `להסיר את "${unlinkTarget.nameHe}" מהחומר? המוצר יישאר במערכת — רק הקשר אל חומר זה יוסר.`
            : ""
        }
        confirmLabel="הסרה מהחומר"
        tone="danger"
        loading={isPending}
        onConfirm={confirmUnlink}
        onCancel={() => setUnlinkTarget(null)}
      />
    </div>
  );
}

type VariantPickerProps = {
  variants: MaterialVariantInput[];
  selectedVariantIds: string[];
  onToggle: (variantId: string, checked: boolean) => void;
};

function VariantPicker({
  variants,
  selectedVariantIds,
  onToggle,
}: VariantPickerProps) {
  if (variants.length === 0) {
    return (
      <p className={formStyles.helperText}>
        יש לשמור variants לחומר לפני שניתן לבחור variants למוצר.
      </p>
    );
  }

  return (
    <div>
      <p className={formStyles.subheading}>Variants מותרים למוצר</p>
      <ul className={formStyles.colorGrid}>
        {variants.map((variant) => {
          const variantId = variant.id ?? "";
          return (
            <li key={variantId}>
              <label className={formStyles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedVariantIds.includes(variantId)}
                  onChange={(event) =>
                    onToggle(variantId, event.target.checked)
                  }
                />
                {variant.name}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
