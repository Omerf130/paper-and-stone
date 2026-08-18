import type { Metadata } from "next";
import Link from "next/link";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import AdminProjectsPagination from "@/components/admin/AdminProjectsPagination/AdminProjectsPagination";
import AdminProjectsToolbar from "@/components/admin/AdminProjectsToolbar/AdminProjectsToolbar";
import cardStyles from "@/components/admin/list/admin-list-card.module.scss";
import layoutStyles from "@/components/admin/list/admin-list-layout.module.scss";
import tableStyles from "@/components/admin/list/admin-table.module.scss";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { requireAdmin } from "@/lib/auth/authorization";
import { getAdminProjects } from "@/lib/projects/getAdminProjects";
import { parseAdminProjectsParams } from "@/lib/projects/project-params";
import { formatDateTime } from "@/lib/ui/format-date-time";
import {
  mapOnboardingStatusToBadge,
  mapProjectStatusToBadge,
} from "@/lib/ui/map-status-badge";

export const metadata: Metadata = {
  title: "פרויקטים | Paper & Stone",
};

type AdminProjectsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function hasProjectFilters(params: ReturnType<typeof parseAdminProjectsParams>): boolean {
  if (params.queue === "onboarding") {
    return Boolean(params.query);
  }

  return Boolean(params.query || params.status !== "submitted");
}

export default async function AdminProjectsPage({
  searchParams,
}: AdminProjectsPageProps) {
  const resolvedSearchParams = await searchParams;
  const params = parseAdminProjectsParams(resolvedSearchParams);
  const user = await requireAdmin();
  const result = await getAdminProjects(params, user.id);
  const filtered = hasProjectFilters(params);
  const isOnboardingQueue = params.queue === "onboarding";

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title="פרויקטים"
        description={
          isOnboardingQueue
            ? "אישור פתיחת פרויקטים חדשים ושיוך לקוחות"
            : "בדיקה ואישור פרויקטים מצד אנשי מקצוע"
        }
      />

      <AdminProjectsToolbar params={params} total={result.total} />

      {result.projects.length === 0 ? (
        <EmptyState
          title={
            filtered
              ? "לא נמצאו פרויקטים שמתאימים לסינון"
              : isOnboardingQueue
                ? "אין פרויקטים שממתינים לאישור פתיחה"
                : "אין פרויקטים שממתינים לבדיקה"
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
                    <th scope="col">איש מקצוע</th>
                    <th scope="col">סטטוס</th>
                    <th scope="col">מוצרים</th>
                    <th scope="col">{isOnboardingQueue ? "עודכן" : "נשלח"}</th>
                    <th scope="col">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {result.projects.map((project) => {
                    const status = isOnboardingQueue && project.onboardingStatus
                      ? mapOnboardingStatusToBadge(project.onboardingStatus)
                      : mapProjectStatusToBadge(project.status);
                    const clientLabel =
                      project.assignedClientFullName ?? project.clientName;

                    return (
                      <tr key={project.id}>
                        <td>
                          <div className={tableStyles.primary}>{project.name}</div>
                          {clientLabel ? (
                            <div className={tableStyles.subtle}>{clientLabel}</div>
                          ) : null}
                          {(project.unreadMessageCount ?? 0) > 0 ? (
                            <div className={cardStyles.unread} role="status">
                              הודעות חדשות: {project.unreadMessageCount}
                            </div>
                          ) : null}
                          {project.quoteStatusLabel ? (
                            <div className={cardStyles.unread} role="status">
                              הצעת מחיר: {project.quoteStatusLabel}
                            </div>
                          ) : null}
                        </td>
                        <td>
                          <div dir="ltr">{project.professionalEmail}</div>
                          {project.professionalName ? (
                            <div className={tableStyles.subtle}>
                              {project.professionalName}
                            </div>
                          ) : null}
                        </td>
                        <td>
                          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                        </td>
                        <td>{project.itemCount}</td>
                        <td>
                          {formatDateTime(
                            isOnboardingQueue
                              ? project.updatedAt
                              : project.submittedAt,
                          )}
                        </td>
                        <td className={tableStyles.actions}>
                          <Link
                            href={`/admin/projects/${project.id}`}
                            className={tableStyles.actionLink}
                          >
                            פתיחה
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <ul className={`${layoutStyles.mobileOnlyDesktop} ${cardStyles.list}`}>
            {result.projects.map((project) => {
              const status = isOnboardingQueue && project.onboardingStatus
                ? mapOnboardingStatusToBadge(project.onboardingStatus)
                : mapProjectStatusToBadge(project.status);
              const clientLabel =
                project.assignedClientFullName ?? project.clientName;

              return (
                <li key={project.id} className={cardStyles.card}>
                  <div className={cardStyles.header}>
                    <p className={cardStyles.title}>{project.name}</p>
                    {clientLabel ? (
                      <p className={cardStyles.subtitle}>{clientLabel}</p>
                    ) : null}
                    {(project.unreadMessageCount ?? 0) > 0 ? (
                      <p className={cardStyles.unread} role="status">
                        הודעות חדשות: {project.unreadMessageCount}
                      </p>
                    ) : null}
                    {project.quoteStatusLabel ? (
                      <p className={cardStyles.unread} role="status">
                        הצעת מחיר: {project.quoteStatusLabel}
                      </p>
                    ) : null}
                  </div>

                  <div className={cardStyles.badges}>
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                  </div>

                  <div className={cardStyles.metaGrid}>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>איש מקצוע:</span>
                      <span className={cardStyles.metaValue} dir="ltr">
                        {project.professionalEmail}
                      </span>
                    </div>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>מוצרים:</span>
                      <span className={cardStyles.metaValue}>{project.itemCount}</span>
                    </div>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>
                        {isOnboardingQueue ? "עודכן:" : "נשלח:"}
                      </span>
                      <span className={cardStyles.metaValue}>
                        {formatDateTime(
                          isOnboardingQueue
                            ? project.updatedAt
                            : project.submittedAt,
                        )}
                      </span>
                    </div>
                  </div>

                  <div className={cardStyles.actions}>
                    <Button
                      href={`/admin/projects/${project.id}`}
                      variant="secondary"
                      size="sm"
                    >
                      פתיחת פרויקט
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <AdminProjectsPagination
        params={params}
        page={result.page}
        totalPages={result.totalPages}
      />
    </AdminPage>
  );
}
