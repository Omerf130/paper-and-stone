import type { Metadata } from "next";
import Link from "next/link";
import Section from "@/components/Section/Section";
import CatalogCategoryFilter from "@/components/catalog/CatalogCategoryFilter";
import CatalogPagination from "@/components/catalog/CatalogPagination";
import CatalogResultSummary from "@/components/catalog/CatalogResultSummary";
import CatalogSearchForm from "@/components/catalog/CatalogSearchForm";
import ProductCatalogGrid from "@/components/catalog/ProductCatalogGrid";
import {
  hasCatalogFilters,
  parseCatalogParams,
} from "@/lib/catalog/catalog-params";
import { getPublicCategories } from "@/lib/catalog/getPublicCategories";
import { getPublicProducts } from "@/lib/products/getPublicProducts";
import styles from "./page.module.scss";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "מוצרים | Paper & Stone",
  description: "מוצרים פעילים מ-Paper & Stone",
};

type ProductsCatalogPageProps = PageProps<"/products">;

export default async function ProductsCatalogPage({
  searchParams,
}: ProductsCatalogPageProps) {
  const resolvedSearchParams = await searchParams;
  const catalogParams = parseCatalogParams(resolvedSearchParams);

  const [categories, catalogResult] = await Promise.all([
    getPublicCategories(),
    getPublicProducts({
      query: catalogParams.query,
      categorySlug: catalogParams.categorySlug,
      page: catalogParams.page,
    }),
  ]);

  const filtersApplied = hasCatalogFilters({
    query: catalogResult.appliedFilters.query,
    categorySlug: catalogResult.appliedFilters.categorySlug,
    page: catalogResult.page,
  });

  const showFilteredEmpty =
    catalogResult.total === 0 && filtersApplied;
  const showGlobalEmpty =
    catalogResult.total === 0 && !filtersApplied;

  return (
    <Section className={styles.section}>
      <header className={styles.header}>
        <h1 className={styles.title}>מוצרים</h1>
        <p className={styles.description}>
          מבחר מוצרים פעילים מ-Paper & Stone.
        </p>
      </header>

      <div className={styles.toolbar}>
        <CatalogSearchForm
          query={catalogResult.appliedFilters.query}
          categorySlug={catalogResult.appliedFilters.categorySlug}
        />
        <CatalogCategoryFilter
          categories={categories}
          activeCategorySlug={catalogResult.appliedFilters.categorySlug}
          query={catalogResult.appliedFilters.query}
        />
      </div>

      {catalogResult.total > 0 ? (
        <CatalogResultSummary
          total={catalogResult.total}
          hasFilters={filtersApplied}
        />
      ) : null}

      {showGlobalEmpty ? (
        <p className={styles.empty}>עדיין לא נוספו מוצרים לקטלוג.</p>
      ) : null}

      {showFilteredEmpty ? (
        <div className={styles.emptyBlock}>
          <p className={styles.empty}>
            לא נמצאו מוצרים שמתאימים לחיפוש.
          </p>
          <Link href="/products" className={styles.resetLink}>
            נקה חיפוש
          </Link>
        </div>
      ) : null}

      {catalogResult.products.length > 0 ? (
        <>
          <ProductCatalogGrid products={catalogResult.products} />
          <CatalogPagination
            page={catalogResult.page}
            totalPages={catalogResult.totalPages}
            query={catalogResult.appliedFilters.query}
            categorySlug={catalogResult.appliedFilters.categorySlug}
          />
        </>
      ) : null}
    </Section>
  );
}
