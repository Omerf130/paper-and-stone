import Link from "next/link";
import { buildCatalogHref } from "@/lib/catalog/catalog-params";
import { getVisiblePageNumbers } from "@/lib/catalog/catalog-pagination";
import styles from "./CatalogPagination.module.scss";

type CatalogPaginationProps = {
  page: number;
  totalPages: number;
  query: string | null;
  categorySlug: string | null;
};

export default function CatalogPagination({
  page,
  totalPages,
  query,
  categorySlug,
}: CatalogPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePageNumbers(page, totalPages);
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  return (
    <nav aria-label="עמודים" className={styles.nav}>
      {isFirstPage ? (
        <span className={styles.disabled} aria-disabled="true">
          הקודם
        </span>
      ) : (
        <Link
          href={buildCatalogHref({ query, categorySlug, page: page - 1 })}
          className={styles.control}
        >
          הקודם
        </Link>
      )}

      <ol className={styles.pages}>
        {visiblePages.map((pageNumber, index) => {
          const previousPage = visiblePages[index - 1];
          const showEllipsis =
            previousPage !== undefined && pageNumber - previousPage > 1;

          return (
            <li key={pageNumber} className={styles.pageItem}>
              {showEllipsis ? (
                <span className={styles.ellipsis} aria-hidden="true">
                  …
                </span>
              ) : null}
              {pageNumber === page ? (
                <span className={styles.current} aria-current="page">
                  {pageNumber}
                </span>
              ) : (
                <Link
                  href={buildCatalogHref({
                    query,
                    categorySlug,
                    page: pageNumber,
                  })}
                  className={styles.pageLink}
                >
                  {pageNumber}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {isLastPage ? (
        <span className={styles.disabled} aria-disabled="true">
          הבא
        </span>
      ) : (
        <Link
          href={buildCatalogHref({ query, categorySlug, page: page + 1 })}
          className={styles.control}
        >
          הבא
        </Link>
      )}
    </nav>
  );
}
