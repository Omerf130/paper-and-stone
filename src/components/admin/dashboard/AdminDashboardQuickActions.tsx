import Button from "@/components/ui/Button/Button";
import styles from "./AdminDashboardQuickActions.module.scss";

export default function AdminDashboardQuickActions() {
  return (
    <section className={styles.section} aria-labelledby="dashboard-actions-title">
      <h2 id="dashboard-actions-title" className={styles.title}>
        פעולות מהירות
      </h2>

      <div className={styles.actions}>
        <Button href="/admin/products/new" variant="secondary" size="sm">
          הוספת מוצר
        </Button>
        <Button href="/admin/categories/new" variant="secondary" size="sm">
          יצירת קטגוריה
        </Button>
        <Button href="/admin/materials" variant="secondary" size="sm">
          ניהול חומרים
        </Button>
        <Button href="/admin/projects" variant="secondary" size="sm">
          צפייה בפרויקטים
        </Button>
      </div>
    </section>
  );
}
