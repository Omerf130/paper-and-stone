import CatalogCategoryFilter from "@/components/catalog/CatalogCategoryFilter";
import CatalogSearchForm from "@/components/catalog/CatalogSearchForm";
import type { CatalogHrefInput } from "@/lib/catalog/catalog-params";
import type { PublicCategoryView } from "@/types/catalog";
import styles from "./CatalogToolbar.module.scss";

type CatalogToolbarProps = {
  query: string | null;
  categorySlug: string | null;
  categories: PublicCategoryView[];
  hrefInput?: CatalogHrefInput;
};

export default function CatalogToolbar({
  query,
  categorySlug,
  categories,
  hrefInput,
}: CatalogToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <CatalogSearchForm
        query={query}
        categorySlug={categorySlug}
        hrefInput={hrefInput}
      />
      <CatalogCategoryFilter
        categories={categories}
        activeCategorySlug={categorySlug}
        query={query}
        hrefInput={hrefInput}
      />
    </div>
  );
}
