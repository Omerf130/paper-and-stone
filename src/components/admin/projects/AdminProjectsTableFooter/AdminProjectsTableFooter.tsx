import Link from "next/link";
import { getVisiblePageNumbers } from "@/lib/catalog/catalog-pagination";
import {
  buildAdminProjectsHref,
  PROJECTS_PAGE_SIZE,
  type AdminProjectsParams,
} from "@/lib/projects/project-params";
import styles from "./AdminProjectsTableFooter.module.scss";

type AdminProjectsTableFooterProps = {
  params: AdminProjectsParams;
  page: number;
  total: number;
  totalPages: number;
};

export default function AdminProjectsTableFooter({
  params,
  page,
  total,
  totalPages,
}: AdminProjectsTableFooterProps) {
  const pageSize = PROJECTS_PAGE_SIZE;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const visiblePages = getVisiblePageNumbers(page, totalPages);
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  function hrefForPage(pageNumber: number): string {
    return buildAdminProjectsHref({
      query: params.query,
      queue: params.queue,
      status: params.status,
      clientId: params.clientId,
      architectId: params.architectId,
      page: pageNumber,
    });
  }

  return (
    <footer className={styles.footer}>
      <p className={styles.summary}>
        {total === 0
          ? "אין פרויקטים להצגה"
          : `מציג ${from}–${to} מתוך ${total} פרויקטים`}
      </p>

      {totalPages > 1 ? (
        <nav aria-label="עמודים" className={styles.pagination}>
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
      ) : null}
    </footer>
  );
}
