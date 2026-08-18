"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { addProductToProjectAction } from "@/app/professional/projects/actions";
import {
  getProductForPickerAction,
  searchProductsForPickerAction,
} from "@/app/professional/projects/picker-actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { ProductPickerItemView } from "@/lib/projects/project-product-picker-queries";
import type { ProductView } from "@/types/product";
import ProjectProductPickerConfigureStep from "./ProjectProductPickerConfigureStep";
import styles from "./ProjectProductPicker.module.scss";

type PickerStep = "browse" | "configure";

type ProjectProductPickerProps = {
  projectId: string;
  roomId: string;
  open: boolean;
  onClose: () => void;
};

export default function ProjectProductPicker({
  projectId,
  roomId,
  open,
  onClose,
}: ProjectProductPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<PickerStep>("browse");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ProductPickerItemView[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<ProductPickerItemView | null>(
    null,
  );
  const [productView, setProductView] = useState<ProductView | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const resetState = () => {
    setStep("browse");
    setQuery("");
    setPage(1);
    setProducts([]);
    setTotalPages(0);
    setSelectedProduct(null);
    setProductView(null);
    setError(undefined);
  };

  const loadProducts = (nextQuery: string, nextPage: number) => {
    setIsLoadingProducts(true);
    setError(undefined);

    startTransition(async () => {
      const result = await searchProductsForPickerAction({
        projectId,
        query: nextQuery,
        page: nextPage,
      });

      setIsLoadingProducts(false);

      if (result.error) {
        setError(result.error);
        setProducts([]);
        setTotalPages(0);
        return;
      }

      setProducts(result.products);
      setTotalPages(result.totalPages);
      setPage(result.page);
    });
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      resetState();
      queueMicrotask(() => {
        loadProducts("", 1);
      });
    }

    if (!open && dialog.open) {
      dialog.close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial browse load only when dialog opens
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const handleSearch = () => {
    setPage(1);
    loadProducts(query, 1);
  };

  const handleSelectProduct = (product: ProductPickerItemView) => {
    setSelectedProduct(product);
    setError(undefined);
    setProductView(null);

    startTransition(async () => {
      const result = await getProductForPickerAction({
        projectId,
        productSlug: product.slug,
      });

      if (result.error || !result.product) {
        setError(result.error ?? "לא ניתן לטעון את המוצר.");
        return;
      }

      setProductView(result.product);
      setStep("configure");
    });
  };

  const handleAdd = (selection: {
    selectedMaterialId?: string;
    selectedColorId?: string;
    selectedSizeKey?: string;
    quantity: number;
  }) => {
    if (!selectedProduct) {
      return;
    }

    setError(undefined);

    startTransition(async () => {
      const result = await addProductToProjectAction({
        projectId,
        roomId,
        productSlug: selectedProduct.slug,
        ...selection,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      toast({ type: "success", message: "המוצר נוסף לפרויקט" });
      router.refresh();
      onClose();
    });
  };

  const handleBack = () => {
    setStep("browse");
    setSelectedProduct(null);
    setProductView(null);
    setError(undefined);
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="product-picker-title"
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 id="product-picker-title" className={styles.title}>
            {step === "browse" ? "הוספת מוצר" : "הגדרת מוצר"}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="סגירה"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {step === "browse" ? (
          <>
            <FormField label="חיפוש מוצרים" htmlFor="product-picker-search">
              <div className={styles.searchRow}>
                <input
                  id="product-picker-search"
                  type="search"
                  className={formFieldStyles.input}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="חיפוש לפי שם או קוד מוצר"
                  disabled={isPending || isLoadingProducts}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSearch}
                  disabled={isPending || isLoadingProducts}
                  loading={isLoadingProducts}
                  loadingLabel="מחפש..."
                >
                  חיפוש
                </Button>
              </div>
            </FormField>

            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}

            <div className={styles.grid} aria-busy={isLoadingProducts || isPending}>
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className={styles.productCard}
                  onClick={() => handleSelectProduct(product)}
                  disabled={isPending || isLoadingProducts}
                >
                  <div className={styles.productImageWrap}>
                    {product.primaryImageUrl ? (
                      <Image
                        src={product.primaryImageUrl}
                        alt=""
                        width={120}
                        height={120}
                        className={styles.productImage}
                      />
                    ) : (
                      <span className={styles.productPlaceholder} aria-hidden="true" />
                    )}
                  </div>
                  <span className={styles.productName}>{product.nameHe}</span>
                  <span className={styles.productMeta}>
                    {[product.sku, product.categoryName].filter(Boolean).join(" · ")}
                  </span>
                </button>
              ))}
            </div>

            {totalPages > 1 ? (
              <div className={styles.pagination}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => loadProducts(query, page - 1)}
                  disabled={isPending || isLoadingProducts || page <= 1}
                >
                  הקודם
                </Button>
                <span className={styles.pageLabel}>
                  עמוד {page} מתוך {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => loadProducts(query, page + 1)}
                  disabled={
                    isPending || isLoadingProducts || page >= totalPages
                  }
                >
                  הבא
                </Button>
              </div>
            ) : null}
          </>
        ) : productView ? (
          <ProjectProductPickerConfigureStep
            product={productView}
            isPending={isPending}
            error={error}
            onBack={handleBack}
            onAdd={handleAdd}
          />
        ) : null}
      </div>
    </dialog>
  );
}
