import Link from "next/link";
import type { CatalogEmptyStateContent } from "@/lib/catalog/get-catalog-empty-state";
import styles from "./CatalogEmptyState.module.scss";

type CatalogEmptyStateProps = {
  content: CatalogEmptyStateContent;
};

export default function CatalogEmptyState({ content }: CatalogEmptyStateProps) {
  return (
    <div className={styles.empty}>
      <p className={styles.message}>{content.message}</p>
      {content.resetHref && content.resetLabel ? (
        <Link href={content.resetHref} className={styles.resetLink}>
          {content.resetLabel}
        </Link>
      ) : null}
    </div>
  );
}
