import AdminPagination from "@/components/admin/list/AdminPagination";
import {
  buildAdminArchitectsHref,
  type AdminArchitectsParams,
} from "@/lib/admin/crm/crm-params";

type AdminArchitectsPaginationProps = {
  params: AdminArchitectsParams;
  page: number;
  totalPages: number;
};

export default function AdminArchitectsPagination({
  params,
  page,
  totalPages,
}: AdminArchitectsPaginationProps) {
  return (
    <AdminPagination
      page={page}
      totalPages={totalPages}
      ariaLabel="עמודי אדריכלים"
      hrefForPage={(pageNumber) =>
        buildAdminArchitectsHref({
          query: params.query,
          status: params.status,
          page: pageNumber,
        })
      }
    />
  );
}
