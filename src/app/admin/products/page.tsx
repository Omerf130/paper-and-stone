import type { Metadata } from "next";
import Link from "next/link";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { getAdminProducts } from "@/lib/products/getAdminProducts";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "מוצרים | Paper & Stone",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>מוצרים</h1>
          <p className={styles.description}>ניהול מוצרים במערכת.</p>
        </div>
        <Link href="/admin/products/new" className={styles.createLink}>
          יצירת מוצר חדש
        </Link>
      </header>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">שם</th>
              <th scope="col">מק״ט</th>
              <th scope="col">קטגוריה</th>
              <th scope="col">סטטוס</th>
              <th scope="col">מומלץ</th>
              <th scope="col">עודכן</th>
              <th scope="col">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.nameHe}</td>
                <td>{product.sku}</td>
                <td>{product.categoryName}</td>
                <td>
                  <AdminStatusBadge
                    active={product.isActive}
                    labelOn="פעיל"
                    labelOff="לא פעיל"
                  />
                </td>
                <td>
                  <AdminStatusBadge
                    active={product.isFeatured}
                    labelOn="מומלץ"
                    labelOff="רגיל"
                  />
                </td>
                <td>{formatDate(product.updatedAt)}</td>
                <td>
                  <Link
                    href={`/admin/products/${product.id}`}
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
