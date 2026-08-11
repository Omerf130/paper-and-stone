import type { Metadata } from "next";
import ProductForm from "@/components/admin/ProductForm/ProductForm";
import { getActiveCategories } from "@/lib/products/getActiveCategories";
import { EMPTY_PRODUCT_FORM } from "@/types/admin-product";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "מוצר חדש | Paper & Stone",
};

export default async function AdminNewProductPage() {
  const categories = await getActiveCategories();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>יצירת מוצר חדש</h1>
        <p className={styles.description}>
          הזינו את פרטי המוצר והגדרות התצורה. לאחר שמירת המוצר ניתן להוסיף
          תמונות.
        </p>
      </header>

      <ProductForm
        mode="create"
        categories={categories}
        initialProduct={EMPTY_PRODUCT_FORM}
      />
    </div>
  );
}
