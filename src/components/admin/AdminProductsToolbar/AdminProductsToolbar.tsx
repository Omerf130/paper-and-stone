import Link from "next/link";
import {
  hasAdminProductsFilters,
  type AdminProductsParams,
} from "@/lib/products/product-params";
import Button from "@/components/ui/Button/Button";
import styles from "@/components/admin/list/admin-list-toolbar.module.scss";

type FilterOption = {
  id: string;
  label: string;
};

type AdminProductsToolbarProps = {
  params: AdminProductsParams;
  total: number;
  categories: FilterOption[];
  suppliers: FilterOption[];
};

const VISIBILITY_OPTIONS = [
  { value: "", label: "הכל" },
  { value: "visible", label: "גלוי" },
  { value: "hidden", label: "מוסתר" },
] as const;

const FEATURED_OPTIONS = [
  { value: "", label: "הכל" },
  { value: "featured", label: "מומלץ" },
  { value: "not-featured", label: "לא מומלץ" },
] as const;

export default function AdminProductsToolbar({
  params,
  total,
  categories,
  suppliers,
}: AdminProductsToolbarProps) {
  const hasFilters = hasAdminProductsFilters(params);

  return (
    <section className={styles.toolbar} aria-label="סינון מוצרים">
      <form method="get" className={styles.form}>
        <div className={styles.filters}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="products-search">
              חיפוש
            </label>
            <input
              id="products-search"
              name="q"
              type="search"
              className={styles.input}
              defaultValue={params.query ?? ""}
              placeholder="שם, מק״ט, slug..."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="products-category">
              קטגוריה
            </label>
            <select
              id="products-category"
              name="category"
              className={styles.select}
              defaultValue={params.categoryId ?? ""}
            >
              <option value="">הכל</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="products-supplier">
              ספק
            </label>
            <select
              id="products-supplier"
              name="supplier"
              className={styles.select}
              defaultValue={params.supplierId ?? ""}
            >
              <option value="">הכל</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="products-visibility">
              נראות
            </label>
            <select
              id="products-visibility"
              name="visibility"
              className={styles.select}
              defaultValue={params.visibility ?? ""}
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="products-featured">
              מומלץ
            </label>
            <select
              id="products-featured"
              name="featured"
              className={styles.select}
              defaultValue={params.featured ?? ""}
            >
              {FEATURED_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="submit" variant="secondary" size="sm">
            סינון
          </Button>
          {hasFilters ? (
            <Link href="/admin/products" className={styles.resetLink}>
              ניקוי סינון
            </Link>
          ) : null}
        </div>
      </form>

      <p className={styles.summary}>{total} מוצרים</p>
    </section>
  );
}
