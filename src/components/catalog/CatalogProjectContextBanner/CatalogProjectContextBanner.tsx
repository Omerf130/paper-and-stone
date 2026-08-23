import Link from "next/link";
import type { ArchitectCatalogProjectContextView } from "@/types/architect-catalog-context";
import styles from "./CatalogProjectContextBanner.module.scss";

type CatalogProjectContextBannerProps = {
  context: ArchitectCatalogProjectContextView;
};

export default function CatalogProjectContextBanner({
  context,
}: CatalogProjectContextBannerProps) {
  return (
    <aside
      className={styles.banner}
      aria-label="הקשר הוספת מוצר לפרויקט"
    >
      <div className={styles.content}>
        <p className={styles.primary}>מוסיפים מוצר לחדר: {context.roomName}</p>
        <p className={styles.secondary}>פרויקט: {context.projectName}</p>
      </div>
      <Link href={context.returnHref} className={styles.returnLink}>
        חזרה לפרויקט
      </Link>
    </aside>
  );
}
