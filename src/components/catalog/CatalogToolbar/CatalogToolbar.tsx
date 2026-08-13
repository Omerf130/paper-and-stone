import CatalogCategoryFilter from "@/components/catalog/CatalogCategoryFilter";
import CatalogSearchForm from "@/components/catalog/CatalogSearchForm";
import type { PublicCategoryView } from "@/types/catalog";
import styles from "./CatalogToolbar.module.scss";

type CatalogToolbarProps = {
  query: string | null;
  categorySlug: string | null;
  categories: PublicCategoryView[];
};

export default function CatalogToolbar({
  query,
  categorySlug,
  categories,
}: CatalogToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <CatalogSearchForm query={query} categorySlug={categorySlug} />
      <CatalogCategoryFilter
        categories={categories}
        activeCategorySlug={categorySlug}
        query={query}
      />
    </div>
  );
}
