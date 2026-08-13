import Link from "next/link";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import styles from "./page.module.scss";

export default function AdminContentPage() {
  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title="תוכן האתר"
        description="ניהול תוכן שיווקי וגלובלי של האתר הציבורי"
      />

      <ul className={styles.list}>
        <li className={styles.item}>
          <div className={styles.itemContent}>
            <h2 className={styles.itemTitle}>דף הבית</h2>
            <p className={styles.itemDescription}>
              Hero, קטגוריות, מוצרים נבחרים, אודות, השראה וסדר סקשנים
            </p>
          </div>
          <Link href="/admin/content/homepage" className={styles.itemLink}>
            עריכה
          </Link>
        </li>
        <li className={styles.item}>
          <div className={styles.itemContent}>
            <h2 className={styles.itemTitle}>עמוד המוצרים</h2>
            <p className={styles.itemDescription}>
              כותרת Hero, תיאור וטקסט תומך בקטלוג
            </p>
          </div>
          <Link href="/admin/content/catalog" className={styles.itemLink}>
            עריכה
          </Link>
        </li>
        <li className={styles.item}>
          <div className={styles.itemContent}>
            <h2 className={styles.itemTitle}>הגדרות אתר</h2>
            <p className={styles.itemDescription}>
              מיתוג, לוגו, פרטי קשר, פוטר ו-SEO בסיסי
            </p>
          </div>
          <Link href="/admin/content/site" className={styles.itemLink}>
            עריכה
          </Link>
        </li>
      </ul>
    </AdminPage>
  );
}
