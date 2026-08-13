import type { Metadata } from "next";
import Container from "@/components/Container/Container";
import Section from "@/components/Section/Section";
import CatalogEmptyState from "@/components/catalog/CatalogEmptyState/CatalogEmptyState";
import CatalogHero from "@/components/catalog/CatalogHero/CatalogHero";
import CatalogPagination from "@/components/catalog/CatalogPagination";
import CatalogResultSummary from "@/components/catalog/CatalogResultSummary";
import CatalogToolbar from "@/components/catalog/CatalogToolbar/CatalogToolbar";
import ProductCatalogGrid from "@/components/catalog/ProductCatalogGrid";
import {
  hasCatalogFilters,
  parseCatalogParams,
} from "@/lib/catalog/catalog-params";
import { getCatalogEmptyState } from "@/lib/catalog/get-catalog-empty-state";
import { getPublicCategories } from "@/lib/catalog/getPublicCategories";
import { getPublicCatalogPageContent } from "@/lib/cms/get-public-catalog-page-content";
import { getPublicProducts } from "@/lib/products/getPublicProducts";

export const metadata: Metadata = {
  title: "מוצרים | Paper & Stone",
  description: "מוצרים פעילים מ-Paper & Stone",
};

type ProductsCatalogPageProps = PageProps<"/products">;

function resolveCategoryName(
  categorySlug: string | null,
  categories: { slug: string; nameHe: string }[],
): string | null {
  if (!categorySlug) {
    return null;
  }

  return categories.find((category) => category.slug === categorySlug)?.nameHe ?? null;
}

export default async function ProductsCatalogPage({
  searchParams,
}: ProductsCatalogPageProps) {
  const resolvedSearchParams = await searchParams;
  const catalogParams = parseCatalogParams(resolvedSearchParams);

  const [categories, catalogResult, catalogContent] = await Promise.all([
    getPublicCategories(),
    getPublicProducts({
      query: catalogParams.query,
      categorySlug: catalogParams.categorySlug,
      page: catalogParams.page,
    }),
    getPublicCatalogPageContent(),
  ]);

  const filtersApplied = hasCatalogFilters({
    query: catalogResult.appliedFilters.query,
    categorySlug: catalogResult.appliedFilters.categorySlug,
    page: catalogResult.page,
  });

  const categoryName = resolveCategoryName(
    catalogResult.appliedFilters.categorySlug,
    categories,
  );

  const emptyState = getCatalogEmptyState({
    query: catalogResult.appliedFilters.query,
    categoryName,
    hasFilters: filtersApplied,
  });

  const showEmpty = catalogResult.total === 0;

  return (
    <Section contained={false}>
      <Container variant="wide">
        <CatalogHero content={catalogContent} />

        <CatalogToolbar
          query={catalogResult.appliedFilters.query}
          categorySlug={catalogResult.appliedFilters.categorySlug}
          categories={categories}
        />

        {catalogResult.total > 0 ? (
          <CatalogResultSummary
            total={catalogResult.total}
            query={catalogResult.appliedFilters.query}
            categoryName={categoryName}
            hasFilters={filtersApplied}
          />
        ) : null}

        {showEmpty ? <CatalogEmptyState content={emptyState} /> : null}

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
      </Container>
    </Section>
  );
}
