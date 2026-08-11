export type PaginationInput = {
  total: number;
  page: number;
  pageSize: number;
};

export type PaginationResult = {
  page: number;
  pageSize: number;
  totalPages: number;
  skip: number;
};

export function normalizePage(page: number): number {
  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

export function calculatePagination({
  total,
  page,
  pageSize,
}: PaginationInput): PaginationResult {
  const normalizedPage = normalizePage(page);
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
  const clampedPage =
    totalPages > 0 ? Math.min(normalizedPage, totalPages) : 1;

  return {
    page: clampedPage,
    pageSize,
    totalPages,
    skip: (clampedPage - 1) * pageSize,
  };
}

export function getVisiblePageNumbers(
  currentPage: number,
  totalPages: number,
): number[] {
  if (totalPages <= 0) {
    return [];
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([
    1,
    totalPages,
    currentPage,
    currentPage - 1,
    currentPage + 1,
  ]);

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}
