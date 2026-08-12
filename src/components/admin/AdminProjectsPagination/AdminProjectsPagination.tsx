import Link from "next/link";
import { getVisiblePageNumbers } from "@/lib/catalog/catalog-pagination";
import {
  buildAdminProjectsHref,
  type AdminProjectsParams,
} from "@/lib/projects/project-params";
import styles from "./AdminProjectsPagination.module.scss";

type AdminProjectsPaginationProps = {
  params: AdminProjectsParams;
  page: number;
  totalPages: number;
};

export default function AdminProjectsPagination({
  params,
  page,
  totalPages,
}: AdminProjectsPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePageNumbers(page, totalPages);
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  const hrefForPage = (pageNumber: number) =>
    buildAdminProjectsHref({
      query: params.query,
      status: params.status,
      page: pageNumber,
    });

  return (
    <nav aria-label="עמודים" className={styles.nav}>
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
