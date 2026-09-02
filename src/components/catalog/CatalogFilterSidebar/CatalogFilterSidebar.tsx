"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { collectDepartmentLeaves } from "@/lib/categories/collect-department-leaves";
import {
  buildCatalogHref,
  type CatalogHrefInput,
} from "@/lib/catalog/catalog-params";
import type { CatalogFilterFacets } from "@/lib/catalog/get-catalog-filter-facets";
import type {
  PublicCategoryNavDepartmentView,
  PublicCategoryNavLeafView,
} from "@/types/public-category-nav";
import { ChevronDownIcon } from "@/components/Header/icons";
import styles from "./CatalogFilterSidebar.module.scss";

type CatalogFilterSidebarProps = {
  departments: PublicCategoryNavDepartmentView[];
  leaves: PublicCategoryNavLeafView[];
  activeCategorySlug: string | null;
  query: string | null;
  brand: string | null;
  material: string | null;
  facets: CatalogFilterFacets;
  hrefInput?: CatalogHrefInput;
  departmentScope?: PublicCategoryNavDepartmentView | null;
};

type FilterSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function FilterSection({ title, children, defaultOpen = false }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={styles.filterSection}>
      <button
        type="button"
        className={styles.filterToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{title}</span>
        <ChevronDownIcon className={isOpen ? styles.chevronOpen : styles.chevron} />
      </button>
      {isOpen ? (
        <div id={panelId} className={styles.filterPanel}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

function renderCategoryItem(input: {
  slug: string;
  label: string;
  isActive: boolean;
  isNavigable: boolean;
  href?: string;
  baseInput: CatalogHrefInput;
  className: string;
  activeClassName: string;
}) {
  if (input.isNavigable && input.href) {
    return (
      <Link
        href={buildCatalogHref({
          ...input.baseInput,
          categorySlug: input.slug,
          page: 1,
        })}
        className={input.isActive ? input.activeClassName : input.className}
        aria-current={input.isActive ? "page" : undefined}
      >
        {input.label}
      </Link>
    );
  }

  return (
    <span
      className={`${input.className} ${styles.categoryLinkDisabled}`}
      aria-disabled="true"
    >
      {input.label}
    </span>
  );
}

function renderDepartmentLandingItem(input: {
  slug: string;
  label: string;
  isActive: boolean;
  baseInput: CatalogHrefInput;
}) {
  return (
    <Link
      href={buildCatalogHref({
        ...input.baseInput,
        categorySlug: input.slug,
        page: 1,
        query: null,
        brand: null,
        material: null,
      })}
      className={input.isActive ? styles.categoryLinkActive : styles.categoryLink}
      aria-current={input.isActive ? "page" : undefined}
    >
      {input.label}
    </Link>
  );
}

export default function CatalogFilterSidebar({
  departments,
  leaves,
  activeCategorySlug,
  query,
  brand,
  material,
  facets,
  hrefInput,
  departmentScope,
}: CatalogFilterSidebarProps) {
  const baseInput: CatalogHrefInput = {
    query,
    categorySlug: activeCategorySlug,
    brand,
    material,
    projectId: hrefInput?.projectId,
    roomId: hrefInput?.roomId,
    sort: hrefInput?.sort,
  };

  const hasFilters = Boolean(query || activeCategorySlug || brand || material);
  const scopedLeaves = departmentScope
    ? collectDepartmentLeaves(departmentScope)
    : leaves;

  return (
    <aside className={styles.sidebar} aria-label="סינון מוצרים">
      <div className={styles.section}>
        <p className={styles.sectionTitle}>קטגוריות</p>
        <ul className={styles.categoryList}>
          {departmentScope ? (
            <>
              <li>
                {renderDepartmentLandingItem({
                  slug: departmentScope.slug,
                  label: `כל ${departmentScope.nameHe}`,
                  isActive: activeCategorySlug === departmentScope.slug,
                  baseInput,
                })}
              </li>
              {scopedLeaves.map((leaf) => (
                <li key={leaf.slug}>
                  {renderCategoryItem({
                    slug: leaf.slug,
                    label: leaf.nameHe,
                    isActive: activeCategorySlug === leaf.slug,
                    isNavigable: leaf.isNavigable,
                    href: leaf.href,
                    baseInput,
                    className: styles.categoryLink,
                    activeClassName: styles.categoryLinkActive,
                  })}
                </li>
              ))}
            </>
          ) : (
            <>
              <li>
                <Link
                  href={buildCatalogHref({
                    ...baseInput,
                    categorySlug: null,
                    page: 1,
                  })}
                  className={
                    activeCategorySlug ? styles.categoryLink : styles.categoryLinkActive
                  }
                  aria-current={activeCategorySlug ? undefined : "page"}
                >
                  כל המוצרים
                </Link>
              </li>
              {departments.map((department) => (
                <li key={department.slug}>
                  {departmentHasLandingSidebarLink(department) ? (
                    renderDepartmentLandingItem({
                      slug: department.slug,
                      label: department.nameHe,
                      isActive: activeCategorySlug === department.slug,
                      baseInput,
                    })
                  ) : (
                    renderCategoryItem({
                      slug: department.slug,
                      label: department.nameHe,
                      isActive: activeCategorySlug === department.slug,
                      isNavigable: department.isNavigable,
                      href: department.href,
                      baseInput,
                      className: styles.categoryLink,
                      activeClassName: styles.categoryLinkActive,
                    })
                  )}
                </li>
              ))}
              {leaves.map((leaf) => (
                <li key={leaf.slug}>
                  {renderCategoryItem({
                    slug: leaf.slug,
                    label: leaf.nameHe,
                    isActive: activeCategorySlug === leaf.slug,
                    isNavigable: leaf.isNavigable,
                    href: leaf.href,
                    baseInput,
                    className: styles.categoryLink,
                    activeClassName: styles.categoryLinkActive,
                  })}
                </li>
              ))}
            </>
          )}
        </ul>
      </div>

      {facets.brands.length > 0 ? (
        <FilterSection title="מותג">
          <ul className={styles.optionList}>
            {facets.brands.map((facetBrand) => {
              const isActive = brand === facetBrand;

              return (
                <li key={facetBrand}>
                  <Link
                    href={buildCatalogHref({
                      ...baseInput,
                      brand: isActive ? null : facetBrand,
                      page: 1,
                    })}
                    className={isActive ? styles.optionActive : styles.option}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {facetBrand}
                  </Link>
                </li>
              );
            })}
          </ul>
        </FilterSection>
      ) : null}

      {facets.materials.length > 0 ? (
        <FilterSection title="חומר">
          <ul className={styles.optionList}>
            {facets.materials.map((facetMaterial) => {
              const isActive = material === facetMaterial;

              return (
                <li key={facetMaterial}>
                  <Link
                    href={buildCatalogHref({
                      ...baseInput,
                      material: isActive ? null : facetMaterial,
                      page: 1,
                    })}
                    className={isActive ? styles.optionActive : styles.option}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {facetMaterial}
                  </Link>
                </li>
              );
            })}
          </ul>
        </FilterSection>
      ) : null}

      {hasFilters ? (
        <Link
          href={buildCatalogHref({
            projectId: hrefInput?.projectId,
            roomId: hrefInput?.roomId,
          })}
          className={styles.reset}
        >
          איפוס סינון
        </Link>
      ) : null}
    </aside>
  );
}

function departmentHasLandingSidebarLink(
  department: PublicCategoryNavDepartmentView,
): boolean {
  return collectDepartmentLeaves(department).length > 0;
}
