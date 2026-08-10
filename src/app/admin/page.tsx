import type { Metadata } from "next";
import Link from "next/link";
import { getAdminDashboardStats } from "@/lib/products/getAdminDashboardStats";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "ניהול | Paper & Stone",
};

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>ראשי</h1>
        <p className={styles.description}>
          סקירה קצרה של מצב המוצרים והקטגוריות במערכת.
        </p>
      </header>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>סה״כ מוצרים</span>
          <span className={styles.statValue}>{stats.totalProducts}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>מוצרים פעילים</span>
          <span className={styles.statValue}>{stats.activeProducts}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>מוצרים מומלצים</span>
          <span className={styles.statValue}>{stats.featuredProducts}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>קטגוריות פעילות</span>
          <span className={styles.statValue}>{stats.activeCategories}</span>
        </div>
      </div>

      <Link href="/admin/products" className={styles.primaryAction}>
        ניהול מוצרים
      </Link>
    </div>
  );
}
