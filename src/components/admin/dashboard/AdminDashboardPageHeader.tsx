import Button from "@/components/ui/Button/Button";
import styles from "./AdminDashboardPageHeader.module.scss";

type AdminDashboardPageHeaderProps = {
  greetingName: string;
};

export default function AdminDashboardPageHeader({
  greetingName,
}: AdminDashboardPageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        <h1 className={styles.greeting}>שלום, {greetingName}</h1>
        <p className={styles.subtitle}>
          סקירה תפעולית — פרויקטים, לקוחות ופעולות שדורשות טיפול.
        </p>
      </div>
      <Button href="/admin/projects/new" size="sm" className={styles.cta}>
        + פרויקט חדש
      </Button>
    </header>
  );
}
