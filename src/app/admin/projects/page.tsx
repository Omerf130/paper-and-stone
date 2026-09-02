import type { Metadata } from "next";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminProjectsToolbar from "@/components/admin/AdminProjectsToolbar/AdminProjectsToolbar";
import AdminProjectListItem from "@/components/admin/projects/AdminProjectListItem/AdminProjectListItem";
import AdminProjectsPageHeader from "@/components/admin/projects/AdminProjectsPageHeader/AdminProjectsPageHeader";
import AdminProjectsTableFooter from "@/components/admin/projects/AdminProjectsTableFooter/AdminProjectsTableFooter";
import AdminProjectsWorkspace from "@/components/admin/projects/AdminProjectsWorkspace/AdminProjectsWorkspace";
import tableStyles from "@/components/admin/projects/admin-projects-table.module.scss";
import layoutStyles from "@/components/admin/list/admin-list-layout.module.scss";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { requireAdmin } from "@/lib/auth/authorization";
import {
  findArchitectByIdForAdmin,
  searchArchitectsForAdmin,
} from "@/lib/admin/architects/architect-lookup-queries";
import {
  findClientByIdForAdmin,
  searchClientsForAdmin,
} from "@/lib/admin/clients/client-lookup-queries";
import {
  formatAdminProjectsFilterOptionLabel,
  mergeAdminProjectsFilterOption,
  type AdminProjectsFilterOption,
} from "@/lib/projects/admin-projects-filter-options";
import {
  getAdminProjects,
  getAdminProjectsQueueSummary,
} from "@/lib/projects/getAdminProjects";
import {
  hasAdminProjectsFilters,
  parseAdminProjectsParams,
} from "@/lib/projects/project-params";
import styles from "./AdminProjectsPage.module.scss";

export const metadata: Metadata = {
  title: "פרויקטים | Paper & Stone",
};

type AdminProjectsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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

async function loadAdminProjectsFilterOptions(params: ReturnType<
  typeof parseAdminProjectsParams
>): Promise<{
  clientOptions: AdminProjectsFilterOption[];
  architectOptions: AdminProjectsFilterOption[];
}> {
  const [clients, architects, selectedClient, selectedArchitect] = await Promise.all([
    searchClientsForAdmin(null),
    searchArchitectsForAdmin(null),
    params.clientId ? findClientByIdForAdmin(params.clientId) : Promise.resolve(null),
    params.architectId
      ? findArchitectByIdForAdmin(params.architectId)
      : Promise.resolve(null),
  ]);

  const clientOptions = mergeAdminProjectsFilterOption(
    clients.map((client) => ({
      id: client.id,
      label: formatAdminProjectsFilterOptionLabel(client),
    })),
    selectedClient
      ? {
          id: selectedClient.id,
          label: formatAdminProjectsFilterOptionLabel(selectedClient),
        }
      : null,
  );

  const architectOptions = mergeAdminProjectsFilterOption(
    architects.map((architect) => ({
      id: architect.id,
      label: formatAdminProjectsFilterOptionLabel(architect),
    })),
    selectedArchitect
      ? {
          id: selectedArchitect.id,
          label: formatAdminProjectsFilterOptionLabel(selectedArchitect),
        }
      : null,
  );

  return { clientOptions, architectOptions };
}

export default async function AdminProjectsPage({
  searchParams,
}: AdminProjectsPageProps) {
  const resolvedSearchParams = await searchParams;
  const params = parseAdminProjectsParams(resolvedSearchParams);
  const user = await requireAdmin();
  const [result, queueSummary, filterOptions] = await Promise.all([
    getAdminProjects(params, user.id),
    getAdminProjectsQueueSummary(),
    loadAdminProjectsFilterOptions(params),
  ]);
  const filtered = hasAdminProjectsFilters(params);

  return (
    <AdminPage width="wide">
      <div className={styles.page}>
        <AdminProjectsPageHeader summary={queueSummary} />

        <AdminProjectsWorkspace>
          <AdminProjectsToolbar
            params={params}
            clientOptions={filterOptions.clientOptions}
            architectOptions={filterOptions.architectOptions}
          />

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
                <div className={tableStyles.tableWrap}>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th scope="col">פרויקט</th>
                        <th scope="col">לקוח</th>
                        <th scope="col">אדריכל</th>
                        <th scope="col">סטטוס</th>
                        <th scope="col">פריטים</th>
                        <th scope="col">עודכן</th>
                        <th scope="col">
                          <span className={tableStyles.srOnly}>פעולות</span>
                        </th>
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

              <ul className={layoutStyles.mobileOnlyDesktop}>
                {result.projects.map((project) => (
                  <AdminProjectListItem
                    key={project.id}
                    project={project}
                    variant="card"
                  />
                ))}
              </ul>

              <AdminProjectsTableFooter
                params={params}
                page={result.page}
                total={result.total}
                totalPages={result.totalPages}
              />
            </>
          )}
        </AdminProjectsWorkspace>
      </div>
    </AdminPage>
  );
}
