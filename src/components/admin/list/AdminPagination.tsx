import Link from "next/link";
import { getVisiblePageNumbers } from "@/lib/catalog/catalog-pagination";
import styles from "./AdminPagination.module.scss";

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  hrefForPage: (pageNumber: number) => string;
  ariaLabel?: string;
};

export default function AdminPagination({
  page,
  totalPages,
  hrefForPage,
  ariaLabel = "עמודים",
}: AdminPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePageNumbers(page, totalPages);
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  return (
    <nav aria-label={ariaLabel} className={styles.nav}>
      {isFirstPage ? (
        <span className={styles.disabled} aria-disabled="true">
          הקודם
        </span>
      ) : (
        <Link href={hrefForPage(page - 1)} className={styles.control}>
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
                <Link href={hrefForPage(pageNumber)} className={styles.pageLink}>
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
        <Link href={hrefForPage(page + 1)} className={styles.control}>
          הבא
        </Link>
      )}
    </nav>
  );
}
