import Link from "next/link";
import { getVisiblePageNumbers } from "@/lib/catalog/catalog-pagination";
import {
  buildAdminUsersHref,
  type AdminUsersParams,
} from "@/lib/users/user-params";
import styles from "./AdminUsersPagination.module.scss";

type AdminUsersPaginationProps = {
  params: AdminUsersParams;
  page: number;
  totalPages: number;
};

export default function AdminUsersPagination({
  params,
  page,
  totalPages,
}: AdminUsersPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePageNumbers(page, totalPages);
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  const hrefForPage = (pageNumber: number) =>
    buildAdminUsersHref({
      query: params.query,
      role: params.role,
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
