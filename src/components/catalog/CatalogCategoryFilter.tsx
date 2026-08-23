import Link from "next/link";
import {
  buildCatalogHref,
  type CatalogHrefInput,
} from "@/lib/catalog/catalog-params";
import type { PublicCategoryView } from "@/types/catalog";
import styles from "./CatalogCategoryFilter.module.scss";

type CatalogCategoryFilterProps = {
  categories: PublicCategoryView[];
  activeCategorySlug: string | null;
  query: string | null;
  hrefInput?: CatalogHrefInput;
};

export default function CatalogCategoryFilter({
  categories,
  activeCategorySlug,
  query,
  hrefInput,
}: CatalogCategoryFilterProps) {
  const baseInput: CatalogHrefInput = {
    query,
    projectId: hrefInput?.projectId,
    roomId: hrefInput?.roomId,
  };
  const allHref = buildCatalogHref(baseInput);

  return (
    <nav aria-label="סינון לפי קטגוריה" className={styles.nav}>
      <ul className={styles.list}>
        <li>
          <Link
            href={allHref}
            className={styles.link}
            aria-current={activeCategorySlug ? undefined : "true"}
          >
            הכל
          </Link>
        </li>
        {categories.map((category) => {
          const isActive = activeCategorySlug === category.slug;

          return (
            <li key={category.slug}>
              <Link
                href={buildCatalogHref({
                  ...baseInput,
                  categorySlug: category.slug,
                })}
                className={styles.link}
                aria-current={isActive ? "true" : undefined}
              >
                {category.nameHe}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
