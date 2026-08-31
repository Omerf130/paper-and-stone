"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  addProductToProjectAsAdminAction,
  getAdminProductViewForProjectAction,
  searchAdminProductsForProjectAction,
  type AdminProductSearchResult,
} from "@/app/admin/projects/item-actions";
import { getProjectRoomsForAdminPickerAction } from "@/app/admin/projects/room-actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import {
  getMaterialById,
  resolveValidColorId,
} from "@/lib/products/configurator-helpers";
import {
  hasMaterials,
  hasSizes,
} from "@/lib/products/product-display-helpers";
import type { ProductView } from "@/types/product";
import dialogStyles from "@/components/professional/projects/project-room-dialog.module.scss";
import styles from "./AdminAddProductToProjectDialog.module.scss";

const MAX_QUANTITY = 999;
const SEARCH_DEBOUNCE_MS = 300;

type AdminAddProductToProjectDialogProps = {
  projectId: string;
  open: boolean;
  onClose: () => void;
};

export default function AdminAddProductToProjectDialog({
  projectId,
  open,
  onClose,
}: AdminAddProductToProjectDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AdminProductSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProductSearchResult | null>(null);
  const [productView, setProductView] = useState<ProductView | null>(null);
  const [productLoading, setProductLoading] = useState(false);

  const [materialId, setMaterialId] = useState("");
  const [colorId, setColorId] = useState("");
  const [sizeKey, setSizeKey] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [roomOptions, setRoomOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const resetForm = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedProduct(null);
    setProductView(null);
    setMaterialId("");
    setColorId("");
    setSizeKey("");
    setQuantity(1);
    setSelectedRoomId("");
    setError(undefined);
  }, []);

  const loadRooms = useCallback(async () => {
    setRoomsLoading(true);
    const result = await getProjectRoomsForAdminPickerAction(projectId);
    setRoomsLoading(false);
    setRoomOptions(result.rooms);
    setSelectedRoomId("");
  }, [projectId]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      resetForm();
      void loadRooms();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, resetForm, loadRooms]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      setSearchLoading(true);
      const result = await searchAdminProductsForProjectAction(trimmed);
      setSearchLoading(false);
      setSearchResults(result.products);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [searchQuery, open]);

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length < 2) {
      setSearchResults([]);
    }
  };

  const handleSelectProduct = async (product: AdminProductSearchResult) => {
    setSelectedProduct(product);
    setError(undefined);
    setProductLoading(true);

    const result = await getAdminProductViewForProjectAction(product.id);
    setProductLoading(false);

    if (result.error || !result.product) {
      setError(result.error ?? "לא ניתן לטעון את המוצר.");
      setSelectedProduct(null);
      return;
    }

    const view = result.product;
    setProductView(view);

    const firstMaterial = view.materialOptions[0];
    const firstMaterialId = firstMaterial?.materialId ?? "";
    const firstColorId = firstMaterial?.colors[0]?.id ?? "";
    const firstSizeKey = view.sizes[0]?.id ?? "";

    setMaterialId(firstMaterialId);
    setColorId(firstColorId);
    setSizeKey(firstSizeKey);
  };

  const handleMaterialChange = (nextMaterialId: string) => {
    if (!productView) {
      return;
    }

    const material = getMaterialById(productView, nextMaterialId);
    if (!material) {
      return;
    }

    setMaterialId(nextMaterialId);
    setColorId((previous) =>
      previous
        ? resolveValidColorId(material, previous) ?? material.colors[0]?.id ?? ""
        : material.colors[0]?.id ?? "",
    );
  };

  const handleSubmit = () => {
    if (!selectedProduct) {
      setError("נא לבחור מוצר.");
      return;
    }

    setError(undefined);

    startTransition(async () => {
      const result = await addProductToProjectAsAdminAction({
        projectId,
        productSlug: selectedProduct.slug,
        quantity,
        selectedMaterialId: materialId || undefined,
        selectedColorId: colorId || undefined,
        selectedSizeKey: sizeKey || undefined,
        roomId: selectedRoomId || undefined,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
      onClose();
    });
  };

  const materialsAvailable = productView ? hasMaterials(productView) : false;
  const sizesAvailable = productView ? hasSizes(productView) : false;
  const currentMaterial =
    productView && materialId ? getMaterialById(productView, materialId) : undefined;

  return (
    <dialog
      ref={dialogRef}
      className={dialogStyles.dialog}
      aria-labelledby="admin-add-product-title"
    >
      <div className={`${dialogStyles.panel} ${styles.widePanel}`}>
        <header className={dialogStyles.header}>
          <h2 id="admin-add-product-title" className={dialogStyles.title}>
            הוספת מוצר לפרויקט
          </h2>
          <button
            type="button"
            className={dialogStyles.closeButton}
            aria-label="סגירה"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {!selectedProduct ? (
          <FormField label="חיפוש מוצר" htmlFor="admin-product-search">
            <input
              id="admin-product-search"
              type="search"
              className={formFieldStyles.input}
              value={searchQuery}
              onChange={(event) => handleSearchQueryChange(event.target.value)}
              placeholder="שם, SKU או קוד..."
              autoComplete="off"
            />
          </FormField>
        ) : null}

        {!selectedProduct && searchQuery.trim().length >= 2 ? (
          <div className={styles.searchResults} role="listbox" aria-label="תוצאות חיפוש">
            {searchLoading ? (
              <p className={styles.hint}>מחפש...</p>
            ) : searchResults.length === 0 ? (
              <p className={styles.hint}>לא נמצאו מוצרים.</p>
            ) : (
              searchResults.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className={styles.searchResultButton}
                  onClick={() => void handleSelectProduct(product)}
                >
                  <span>{product.nameHe}</span>
                  <span className={styles.searchResultMeta} dir="ltr">
                    {product.sku}
                  </span>
                </button>
              ))
            )}
          </div>
        ) : null}

        {selectedProduct ? (
          <div className={styles.selectedProduct}>
            <p className={styles.selectedLabel}>
              מוצר נבחר: <strong>{selectedProduct.nameHe}</strong>
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedProduct(null);
                setProductView(null);
              }}
            >
              שינוי מוצר
            </Button>
          </div>
        ) : null}

        {productLoading ? <p className={styles.hint}>טוען תצורה...</p> : null}

        {productView ? (
          <div className={styles.configSection}>
            {materialsAvailable && currentMaterial ? (
              <FormField label="חומר" htmlFor="admin-add-material">
                <select
                  id="admin-add-material"
                  className={formFieldStyles.select}
                  value={materialId}
                  onChange={(event) => handleMaterialChange(event.target.value)}
                  disabled={isPending}
                >
                  {productView.materialOptions.map((material) => (
                    <option key={material.materialId} value={material.materialId}>
                      {material.materialName}
                    </option>
                  ))}
                </select>
              </FormField>
            ) : null}

            {materialsAvailable && currentMaterial ? (
              <FormField label="צבע" htmlFor="admin-add-color">
                <select
                  id="admin-add-color"
                  className={formFieldStyles.select}
                  value={colorId}
                  onChange={(event) => setColorId(event.target.value)}
                  disabled={isPending}
                >
                  {currentMaterial.colors.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </FormField>
            ) : null}

            {sizesAvailable ? (
              <FormField label="מידה" htmlFor="admin-add-size">
                <select
                  id="admin-add-size"
                  className={formFieldStyles.select}
                  value={sizeKey}
                  onChange={(event) => setSizeKey(event.target.value)}
                  disabled={isPending}
                >
                  {productView.sizes.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </FormField>
            ) : null}

            <FormField label="כמות" htmlFor="admin-add-quantity" required>
              <input
                id="admin-add-quantity"
                type="number"
                min={1}
                max={MAX_QUANTITY}
                className={formFieldStyles.input}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                disabled={isPending}
              />
            </FormField>

            <FormField label="חדר (אופציונלי)" htmlFor="admin-add-room">
              <select
                id="admin-add-room"
                className={formFieldStyles.select}
                value={selectedRoomId}
                onChange={(event) => setSelectedRoomId(event.target.value)}
                disabled={isPending || roomsLoading}
              >
                <option value="">ללא חדר</option>
                {roomOptions.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        ) : null}

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <div className={dialogStyles.actions}>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            ביטול
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isPending}
            loadingLabel="מוסיף..."
            disabled={!selectedProduct || productLoading}
          >
            הוספת מוצר
          </Button>
        </div>
      </div>
    </dialog>
  );
}
