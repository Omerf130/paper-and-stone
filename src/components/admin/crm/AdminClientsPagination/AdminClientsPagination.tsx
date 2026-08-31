import AdminPagination from "@/components/admin/list/AdminPagination";
import {
  buildAdminClientsHref,
  type AdminClientsParams,
} from "@/lib/admin/crm/crm-params";

type AdminClientsPaginationProps = {
  params: AdminClientsParams;
  page: number;
  totalPages: number;
};

export default function AdminClientsPagination({
  params,
  page,
  totalPages,
}: AdminClientsPaginationProps) {
  return (
    <AdminPagination
      page={page}
      totalPages={totalPages}
      ariaLabel="עמודי לקוחות"
      hrefForPage={(pageNumber) =>
        buildAdminClientsHref({
          query: params.query,
          accountStatus: params.accountStatus,
          status: params.status,
          page: pageNumber,
        })
      }
    />
  );
}
