import styles from "./AdminProductsLibraryFooter.module.scss";

type AdminProductsLibraryFooterProps = {
  total: number;
};

export default function AdminProductsLibraryFooter({
  total,
}: AdminProductsLibraryFooterProps) {
  return (
    <footer className={styles.footer}>
      <p className={styles.summary}>{total} מוצרים</p>
    </footer>
  );
}
