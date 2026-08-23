import styles from "./CatalogSearchForm.module.scss";
import type { CatalogHrefInput } from "@/lib/catalog/catalog-params";

type CatalogSearchFormProps = {
  query: string | null;
  categorySlug: string | null;
  hrefInput?: CatalogHrefInput;
};

export default function CatalogSearchForm({
  query,
  categorySlug,
  hrefInput,
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
        {hrefInput?.projectId ? (
          <input type="hidden" name="project" value={hrefInput.projectId} />
        ) : null}
        {hrefInput?.roomId ? (
          <input type="hidden" name="room" value={hrefInput.roomId} />
        ) : null}
        <button type="submit" className={styles.button}>
          חיפוש
        </button>
      </div>
    </form>
  );
}
