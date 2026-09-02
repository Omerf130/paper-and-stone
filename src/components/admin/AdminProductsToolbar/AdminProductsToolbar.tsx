"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, type ChangeEvent, type FormEvent } from "react";
import {
  hasAdminProductsFilters,
  type AdminProductsParams,
} from "@/lib/products/product-params";
import styles from "./AdminProductsToolbar.module.scss";

type FilterOption = {
  id: string;
  label: string;
};

type AdminProductsToolbarProps = {
  params: AdminProductsParams;
  categories: FilterOption[];
  suppliers: FilterOption[];
};

const VISIBILITY_OPTIONS = [
  { value: "", label: "נראות: הכל" },
  { value: "visible", label: "גלוי" },
  { value: "hidden", label: "מוסתר" },
] as const;

const FEATURED_OPTIONS = [
  { value: "", label: "מומלץ: הכל" },
  { value: "featured", label: "מומלץ" },
  { value: "not-featured", label: "לא מומלץ" },
] as const;

function buildProductsHref(form: HTMLFormElement): string {
  const formData = new FormData(form);
  const nextParams = new URLSearchParams();

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && value.trim()) {
      nextParams.set(key, value);
    }
  }

  return nextParams.toString()
    ? `/admin/products?${nextParams.toString()}`
    : "/admin/products";
}

export default function AdminProductsToolbar({
  params,
  categories,
  suppliers,
}: AdminProductsToolbarProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const showReset = hasAdminProductsFilters(params);

  function navigateTo(href: string) {
    startTransition(() => {
      router.push(href);
    });
  }

  function handleSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const form = event.currentTarget.form;
    if (!form) {
      return;
    }

    navigateTo(buildProductsHref(form));
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigateTo(buildProductsHref(event.currentTarget));
  }

  return (
    <div className={styles.toolbar} aria-label="סינון מוצרים">
      <form method="get" className={styles.form} onSubmit={handleSearchSubmit}>
        <div className={styles.searchWrap}>
          <label className={styles.srOnly} htmlFor="products-search">
            חיפוש
          </label>
          <input
            id="products-search"
            name="q"
            type="search"
            className={styles.search}
            defaultValue={params.query ?? ""}
            placeholder="חיפוש מוצרים..."
          />
        </div>

        <div className={styles.selectWrap}>
          <label className={styles.srOnly} htmlFor="products-category">
            קטגוריה
          </label>
          <select
            id="products-category"
            name="category"
            className={styles.select}
            defaultValue={params.categoryId ?? ""}
            onChange={handleSelectChange}
          >
            <option value="">קטגוריה: הכל</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectWrap}>
          <label className={styles.srOnly} htmlFor="products-supplier">
            ספק
          </label>
          <select
            id="products-supplier"
            name="supplier"
            className={styles.select}
            defaultValue={params.supplierId ?? ""}
            onChange={handleSelectChange}
          >
            <option value="">ספק: הכל</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectWrap}>
          <label className={styles.srOnly} htmlFor="products-visibility">
            נראות
          </label>
          <select
            id="products-visibility"
            name="visibility"
            className={styles.select}
            defaultValue={params.visibility ?? ""}
            onChange={handleSelectChange}
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectWrap}>
          <label className={styles.srOnly} htmlFor="products-featured">
            מומלץ
          </label>
          <select
            id="products-featured"
            name="featured"
            className={styles.select}
            defaultValue={params.featured ?? ""}
            onChange={handleSelectChange}
          >
            {FEATURED_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {showReset ? (
          <Link href="/admin/products" className={styles.resetLink}>
            ניקוי
          </Link>
        ) : null}
      </form>
    </div>
  );
}
