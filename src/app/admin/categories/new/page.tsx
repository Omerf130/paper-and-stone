import type { Metadata } from "next";
import CategoryForm from "@/components/admin/CategoryForm/CategoryForm";
import { EMPTY_CATEGORY_FORM } from "@/types/admin-category";
import styles from "../../products/new/page.module.scss";

export const metadata: Metadata = {
  title: "קטגוריה חדשה | Paper & Stone",
};

export default function AdminNewCategoryPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>יצירת קטגוריה חדשה</h1>
        <p className={styles.description}>הזינו את פרטי הקטגוריה.</p>
      </header>

      <CategoryForm mode="create" initialCategory={EMPTY_CATEGORY_FORM} />
    </div>
  );
}
