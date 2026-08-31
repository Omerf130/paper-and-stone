import type { Metadata } from "next";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import AdminProjectsPagination from "@/components/admin/AdminProjectsPagination/AdminProjectsPagination";
import AdminProjectsToolbar from "@/components/admin/AdminProjectsToolbar/AdminProjectsToolbar";
import AdminProjectListItem from "@/components/admin/projects/AdminProjectListItem/AdminProjectListItem";
import Button from "@/components/ui/Button/Button";
import cardStyles from "@/components/admin/list/admin-list-card.module.scss";
import layoutStyles from "@/components/admin/list/admin-list-layout.module.scss";
import tableStyles from "@/components/admin/list/admin-table.module.scss";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { requireAdmin } from "@/lib/auth/authorization";
import { getAdminProjects } from "@/lib/projects/getAdminProjects";
import {
  parseAdminProjectsParams,
} from "@/lib/projects/project-params";

export const metadata: Metadata = {
  title: "פרויקטים | Paper & Stone",
};

type AdminProjectsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function hasProjectFilters(params: ReturnType<typeof parseAdminProjectsParams>): boolean {
  return Boolean(
    params.query ||
      (params.queue === "commercial" && params.status !== "submitted"),
  );
}

const EMPTY_COPY: Record<
  ReturnType<typeof parseAdminProjectsParams>["queue"],
  string
> = {
  all: "אין פרויקטים",
  attention: "אין פרויקטים שדורשים טיפול כרגע",
  active: "אין פרויקטים פעילים",
  commercial: "אין פרויקטים שממתינים לבדיקה מסחרית",
  onboarding: "אין פרויקטים שממתינים לאישור פתיחה",
};

export default async function AdminProjectsPage({
  searchParams,
}: AdminProjectsPageProps) {
  const resolvedSearchParams = await searchParams;
  const params = parseAdminProjectsParams(resolvedSearchParams);
  const user = await requireAdmin();
  const result = await getAdminProjects(params, user.id);
  const filtered = hasProjectFilters(params);

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title="פרויקטים"
        description="מרחב עבודה תפעולי — מעקב, תמחור וטיפול בפרויקטים"
        actions={
          <Button href="/admin/projects/new" size="sm">
            צור פרויקט
          </Button>
        }
      />

      <AdminProjectsToolbar params={params} total={result.total} />

      {result.projects.length === 0 ? (
        <EmptyState
          title={
            filtered
              ? "לא נמצאו פרויקטים שמתאימים לחיפוש"
              : EMPTY_COPY[params.queue]
          }
        />
      ) : (
        <>
          <div className={layoutStyles.desktopOnlyDesktop}>
            <div className={tableStyles.wrap}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th scope="col">פרויקט</th>
                    <th scope="col">אדריכל</th>
                    <th scope="col">סטטוס</th>
                    <th scope="col">חדרים / מוצרים</th>
                    <th scope="col">עודכן</th>
                    <th scope="col">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {result.projects.map((project) => (
                    <AdminProjectListItem
                      key={project.id}
                      project={project}
                      variant="table"
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ul className={`${cardStyles.list} ${layoutStyles.mobileOnlyDesktop}`}>
            {result.projects.map((project) => (
              <AdminProjectListItem
                key={project.id}
                project={project}
                variant="card"
              />
            ))}
          </ul>

          <AdminProjectsPagination
            params={params}
            page={result.page}
            totalPages={result.totalPages}
          />
        </>
      )}
    </AdminPage>
  );
}
