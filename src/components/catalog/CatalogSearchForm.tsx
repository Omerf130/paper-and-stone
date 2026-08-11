import styles from "./CatalogSearchForm.module.scss";

type CatalogSearchFormProps = {
  query: string | null;
  categorySlug: string | null;
};

export default function CatalogSearchForm({
  query,
  categorySlug,
}: CatalogSearchFormProps) {
  return (
    <form method="get" action="/products" className={styles.form}>
      <label className={styles.label} htmlFor="catalog-search">
        חיפוש מוצרים
      </label>
      <div className={styles.row}>
        <input
          id="catalog-search"
          name="q"
          type="search"
          className={styles.input}
          defaultValue={query ?? ""}
          placeholder="שם, מותג, מעצב או מק״ט"
        />
        {categorySlug ? (
          <input type="hidden" name="category" value={categorySlug} />
        ) : null}
        <button type="submit" className={styles.button}>
          חיפוש
        </button>
      </div>
    </form>
  );
}
