import type { Metadata } from "next";
import Container from "@/components/Container/Container";
import Section from "@/components/Section/Section";
import CatalogEmptyState from "@/components/catalog/CatalogEmptyState/CatalogEmptyState";
import CatalogFilterSidebar from "@/components/catalog/CatalogFilterSidebar/CatalogFilterSidebar";
import CatalogHero from "@/components/catalog/CatalogHero/CatalogHero";
import CatalogPagination from "@/components/catalog/CatalogPagination";
import CatalogProjectContextBanner from "@/components/catalog/CatalogProjectContextBanner/CatalogProjectContextBanner";
import CatalogSortControl from "@/components/catalog/CatalogSortControl/CatalogSortControl";
import DepartmentCategoryGrid from "@/components/catalog/DepartmentCategoryGrid/DepartmentCategoryGrid";
import ProductCatalogGrid from "@/components/catalog/ProductCatalogGrid";
import { collectDepartmentLeaves } from "@/lib/categories/collect-department-leaves";
import {
  getPublicCatalogCategoryLeaves,
  getPublicCategoryNavTree,
} from "@/lib/categories/get-public-category-nav-tree";
import {
  catalogParamsToHrefInput,
  hasCatalogFilters,
  hasCatalogProjectContext,
  parseCatalogParams,
} from "@/lib/catalog/catalog-params";
import { getCatalogEmptyState } from "@/lib/catalog/get-catalog-empty-state";
import { getCatalogFilterFacets } from "@/lib/catalog/get-catalog-filter-facets";
import { resolveCatalogCategoryView } from "@/lib/catalog/resolve-catalog-category-view";
import { getPublicCatalogPageContent } from "@/lib/cms/get-public-catalog-page-content";
import { canAccessArchitectWorkspace } from "@/lib/auth/account-access";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getArchitectCatalogProjectContext } from "@/lib/projects/get-architect-catalog-project-context";
import { getPublicProducts } from "@/lib/products/getPublicProducts";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "מוצרים | Paper & Stone",
  description: "מוצרים פעילים מ-Paper & Stone",
};

type ProductsCatalogPageProps = PageProps<"/products">;

function resolveCategoryName(
  categorySlug: string | null,
  navTree: Awaited<ReturnType<typeof getPublicCategoryNavTree>>,
): string | null {
  if (!categorySlug) {
    return null;
  }

  const department = navTree.departments.find((item) => item.slug === categorySlug);
  if (department) {
    return department.nameHe;
  }

  for (const item of navTree.departments) {
    const leaf = [...item.directLeaves, ...item.groups.flatMap((group) => group.leaves)].find(
      (candidate) => candidate.slug === categorySlug,
    );

    if (leaf) {
      return leaf.nameHe;
    }
  }

  return null;
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

  const [navTree, catalogView, catalogContent] = await Promise.all([
    getPublicCategoryNavTree(),
    resolveCatalogCategoryView(catalogParams),
    getPublicCatalogPageContent(),
  ]);

  const isDepartmentLanding = catalogView.mode === "department-landing";
  const departmentScope =
    catalogView.mode === "department-landing"
      ? catalogView.department
      : catalogView.mode === "leaf-products"
        ? catalogView.departmentContext?.department ?? null
        : null;

  const [leaves, catalogResult, facets] = await Promise.all([
    getPublicCatalogCategoryLeaves(),
    isDepartmentLanding
      ? Promise.resolve(null)
      : getPublicProducts({
          query: catalogParams.query,
          categorySlug: catalogParams.categorySlug,
          brand: catalogParams.brand,
          material: catalogParams.material,
          sort: catalogParams.sort,
          page: catalogParams.page,
        }),
    isDepartmentLanding
      ? Promise.resolve({ brands: [], materials: [] })
      : getCatalogFilterFacets({
          query: catalogParams.query,
          categorySlug: catalogParams.categorySlug,
        }),
  ]);

  const filtersApplied = hasCatalogFilters(catalogParams);

  const activeCategorySlug = isDepartmentLanding
    ? catalogView.department.slug
    : catalogResult?.appliedFilters.categorySlug ?? null;

  const categoryName = isDepartmentLanding
    ? catalogView.department.nameHe
    : resolveCategoryName(catalogResult?.appliedFilters.categorySlug ?? null, navTree);

  const activeDepartment =
    catalogView.mode === "department-landing"
      ? catalogView.department
      : navTree.departments.find(
          (department) => department.slug === catalogResult?.appliedFilters.categorySlug,
        );

  const emptyState = getCatalogEmptyState({
    query: catalogResult?.appliedFilters.query ?? null,
    categoryName,
    hasFilters: filtersApplied,
  });

  const showEmpty =
    !isDepartmentLanding && catalogResult !== null && catalogResult.total === 0;

  const departmentLeaves = isDepartmentLanding
    ? collectDepartmentLeaves(catalogView.department)
    : [];

  return (
    <Section contained={false}>
      <div className={styles.page}>
        <Container variant="wide">
          {projectContext ? (
            <CatalogProjectContextBanner context={projectContext} />
          ) : null}

          <div className={styles.topBar}>
            <CatalogHero
              content={catalogContent}
              title={categoryName ?? catalogContent.heading}
              description={
                activeDepartment?.descriptionHe ??
                activeDepartment?.descriptionEn ??
                catalogContent.supportingText
              }
            />
            {!isDepartmentLanding && catalogResult ? (
              <CatalogSortControl
                sort={catalogResult.appliedFilters.sort}
                hrefInput={hrefInput}
              />
            ) : null}
          </div>

          <div className={styles.layout}>
            <CatalogFilterSidebar
              departments={navTree.departments}
              leaves={leaves}
              activeCategorySlug={activeCategorySlug}
              query={catalogResult?.appliedFilters.query ?? null}
              brand={catalogResult?.appliedFilters.brand ?? null}
              material={catalogResult?.appliedFilters.material ?? null}
              facets={facets}
              hrefInput={projectContext ? hrefInput : undefined}
              departmentScope={departmentScope}
            />

            <div className={styles.main}>
              {isDepartmentLanding ? (
                <DepartmentCategoryGrid
                  leaves={departmentLeaves}
                  hrefInput={projectContext ? hrefInput : undefined}
                />
              ) : null}

              {showEmpty ? <CatalogEmptyState content={emptyState} /> : null}

              {!isDepartmentLanding && catalogResult && catalogResult.products.length > 0 ? (
                <>
                  <ProductCatalogGrid
                    products={catalogResult.products}
                    hrefInput={projectContext ? hrefInput : undefined}
                  />
                  <CatalogPagination
                    page={catalogResult.page}
                    totalPages={catalogResult.totalPages}
                    hrefInput={hrefInput}
                  />
                </>
              ) : null}
            </div>
          </div>
        </Container>
      </div>
    </Section>
  );
}
