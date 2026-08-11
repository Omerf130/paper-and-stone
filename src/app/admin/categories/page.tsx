import type { Metadata } from "next";
import Link from "next/link";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { getAdminCategories } from "@/lib/categories/getAdminCategories";
import styles from "../products/page.module.scss";

export const metadata: Metadata = {
  title: "קטגוריות | Paper & Stone",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>קטגוריות</h1>
          <p className={styles.description}>ניהול קטגוריות מוצרים במערכת.</p>
        </div>
        <Link href="/admin/categories/new" className={styles.createLink}>
          יצירת קטגוריה חדשה
        </Link>
      </header>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">שם</th>
              <th scope="col">שם באנגלית</th>
              <th scope="col">כתובת</th>
              <th scope="col">סדר</th>
              <th scope="col">מוצרים</th>
              <th scope="col">סטטוס</th>
              <th scope="col">עודכן</th>
              <th scope="col">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.nameHe}</td>
                <td>{category.nameEn ?? "—"}</td>
                <td dir="ltr">{category.slug}</td>
                <td>{category.sortOrder}</td>
                <td>{category.productCount}</td>
                <td>
                  <AdminStatusBadge
                    active={category.isActive}
                    labelOn="פעיל"
                    labelOff="לא פעיל"
                  />
                </td>
                <td>{formatDate(category.updatedAt)}</td>
                <td>
                  <Link
                    href={`/admin/categories/${category.id}`}
                    className={styles.editLink}
                  >
                    עריכה
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
