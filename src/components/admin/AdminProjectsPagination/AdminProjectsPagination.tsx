import AdminPagination from "@/components/admin/list/AdminPagination";
import {
  buildAdminProjectsHref,
  type AdminProjectsParams,
} from "@/lib/projects/project-params";

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
  return (
    <AdminPagination
      page={page}
      totalPages={totalPages}
      hrefForPage={(pageNumber) =>
        buildAdminProjectsHref({
          query: params.query,
          queue: params.queue,
          status: params.status,
          page: pageNumber,
        })
      }
    />
  );
}
