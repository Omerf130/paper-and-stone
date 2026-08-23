import type { Metadata } from "next";
import Container from "@/components/Container/Container";
import Section from "@/components/Section/Section";
import CatalogEmptyState from "@/components/catalog/CatalogEmptyState/CatalogEmptyState";
import CatalogHero from "@/components/catalog/CatalogHero/CatalogHero";
import CatalogPagination from "@/components/catalog/CatalogPagination";
import CatalogProjectContextBanner from "@/components/catalog/CatalogProjectContextBanner/CatalogProjectContextBanner";
import CatalogResultSummary from "@/components/catalog/CatalogResultSummary";
import CatalogToolbar from "@/components/catalog/CatalogToolbar/CatalogToolbar";
import ProductCatalogGrid from "@/components/catalog/ProductCatalogGrid";
import {
  catalogParamsToHrefInput,
  hasCatalogFilters,
  hasCatalogProjectContext,
  parseCatalogParams,
} from "@/lib/catalog/catalog-params";
import { getCatalogEmptyState } from "@/lib/catalog/get-catalog-empty-state";
import { getPublicCategories } from "@/lib/catalog/getPublicCategories";
import { getPublicCatalogPageContent } from "@/lib/cms/get-public-catalog-page-content";
import { canAccessArchitectWorkspace } from "@/lib/auth/account-access";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getArchitectCatalogProjectContext } from "@/lib/projects/get-architect-catalog-project-context";
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
  const hrefInput = catalogParamsToHrefInput(catalogParams);
  const user = await getCurrentUser();

  const projectContext =
    hasCatalogProjectContext(catalogParams) &&
    user &&
    canAccessArchitectWorkspace(user)
      ? await getArchitectCatalogProjectContext(user.id, {
          projectId: catalogParams.projectId,
          roomId: catalogParams.roomId,
        })
      : null;

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
    projectId: catalogParams.projectId,
    roomId: catalogParams.roomId,
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
        {projectContext ? (
          <CatalogProjectContextBanner context={projectContext} />
        ) : null}

        <CatalogHero content={catalogContent} />

        <CatalogToolbar
          query={catalogResult.appliedFilters.query}
          categorySlug={catalogResult.appliedFilters.categorySlug}
          categories={categories}
          hrefInput={projectContext ? hrefInput : undefined}
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
            <ProductCatalogGrid
              products={catalogResult.products}
              hrefInput={projectContext ? hrefInput : undefined}
            />
            <CatalogPagination
              page={catalogResult.page}
              totalPages={catalogResult.totalPages}
              query={catalogResult.appliedFilters.query}
              categorySlug={catalogResult.appliedFilters.categorySlug}
              hrefInput={projectContext ? hrefInput : undefined}
            />
          </>
        ) : null}
      </Container>
    </Section>
  );
}
