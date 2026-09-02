import styles from "./AdminProjectItemsTableFooter.module.scss";

type AdminProjectItemsTableFooterProps = {
  visibleCount: number;
  totalCount: number;
  hasSearch: boolean;
};

export default function AdminProjectItemsTableFooter({
  visibleCount,
  totalCount,
  hasSearch,
}: AdminProjectItemsTableFooterProps) {
  const label = hasSearch
    ? `מציג ${visibleCount} מתוך ${totalCount} פריטים`
    : `${totalCount} פריטים`;

  return (
    <footer className={styles.footer}>
      <span className={styles.label}>{label}</span>
    </footer>
  );
}
