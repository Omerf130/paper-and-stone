import AdminPagination from "@/components/admin/list/AdminPagination";
import {
  buildAdminUsersHref,
  type AdminUsersParams,
} from "@/lib/users/user-params";

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
  return (
    <AdminPagination
      page={page}
      totalPages={totalPages}
      hrefForPage={(pageNumber) =>
        buildAdminUsersHref({
          query: params.query,
          role: params.role,
          status: params.status,
          page: pageNumber,
        })
      }
    />
  );
}
