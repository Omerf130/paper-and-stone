import type { Metadata } from "next";
import Link from "next/link";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import AdminArchitectsPagination from "@/components/admin/crm/AdminArchitectsPagination/AdminArchitectsPagination";
import AdminArchitectsToolbar from "@/components/admin/crm/AdminArchitectsToolbar/AdminArchitectsToolbar";
import cardStyles from "@/components/admin/list/admin-list-card.module.scss";
import layoutStyles from "@/components/admin/list/admin-list-layout.module.scss";
import tableStyles from "@/components/admin/list/admin-table.module.scss";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { getAdminArchitects } from "@/lib/admin/architects/getAdminArchitects";
import { parseAdminArchitectsParams } from "@/lib/admin/crm/crm-params";
import { countPendingArchitectRequests } from "@/lib/users/architect-request-queries";
import { formatDateTime } from "@/lib/ui/format-date-time";
import { mapEntityActiveToBadge } from "@/lib/ui/map-status-badge";

export const metadata: Metadata = {
  title: "אדריכלים | Paper & Stone",
};

type AdminArchitectsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function hasArchitectFilters(
  params: ReturnType<typeof parseAdminArchitectsParams>,
): boolean {
  return Boolean(params.query || params.status);
}

export default async function AdminArchitectsPage({
  searchParams,
}: AdminArchitectsPageProps) {
  const resolvedSearchParams = await searchParams;
  const params = parseAdminArchitectsParams(resolvedSearchParams);
  const [result, pendingRequestCount] = await Promise.all([
    getAdminArchitects(params),
    countPendingArchitectRequests(),
  ]);
  const filtered = hasArchitectFilters(params);

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title="אדריכלים"
        description="ניהול אדריכלים, פרופילים ופרויקטים"
        actions={
          <Button href="/admin/architects/new" size="sm">
            יצירת אדריכל
          </Button>
        }
      />

      <AdminArchitectsToolbar
        params={params}
        total={result.total}
        pendingRequestCount={pendingRequestCount}
      />

      {result.architects.length === 0 ? (
        <EmptyState
          title={
            filtered
              ? "לא נמצאו אדריכלים שמתאימים לחיפוש"
              : "אין עדיין אדריכלים רשומים"
          }
          action={
            !filtered ? (
              <Button href="/admin/architects/new" size="sm">
                יצירת אדריכל
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className={layoutStyles.desktopOnlyDesktop}>
            <div className={tableStyles.wrap}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th scope="col">שם</th>
                    <th scope="col">אימייל</th>
                    <th scope="col">חברה</th>
                    <th scope="col">טלפון</th>
                    <th scope="col">פרופיל</th>
                    <th scope="col">פעילות</th>
                    <th scope="col">פרויקטים</th>
                    <th scope="col">עודכן</th>
                    <th scope="col">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {result.architects.map((architect) => {
                    const activeStatus = mapEntityActiveToBadge(architect.isActive);

                    return (
                      <tr key={architect.id}>
                        <td className={tableStyles.primary}>
                          {architect.fullName ?? "—"}
                        </td>
                        <td dir="ltr">{architect.email}</td>
                        <td>{architect.companyName ?? "—"}</td>
                        <td dir="ltr">{architect.phone ?? "—"}</td>
                        <td>
                          {architect.profileFilledCount}/{architect.profileTotalCount}
                        </td>
                        <td>
                          <StatusBadge tone={activeStatus.tone}>
                            {activeStatus.label}
                          </StatusBadge>
                        </td>
                        <td>{architect.projectCount}</td>
                        <td>{formatDateTime(architect.updatedAt)}</td>
                        <td className={tableStyles.actions}>
                          <Link
                            href={`/admin/architects/${architect.id}`}
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
            {result.architects.map((architect) => {
              const activeStatus = mapEntityActiveToBadge(architect.isActive);

              return (
                <li key={architect.id} className={cardStyles.card}>
                  <div className={cardStyles.header}>
                    <p className={cardStyles.title}>
                      {architect.fullName ?? architect.email}
                    </p>
                    <p className={cardStyles.subtitle} dir="ltr">
                      {architect.email}
                    </p>
                  </div>

                  <div className={cardStyles.badges}>
                    <StatusBadge tone={activeStatus.tone}>
                      {activeStatus.label}
                    </StatusBadge>
                  </div>

                  <div className={cardStyles.metaGrid}>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>חברה:</span>
                      <span className={cardStyles.metaValue}>
                        {architect.companyName ?? "—"}
                      </span>
                    </div>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>פרויקטים:</span>
                      <span className={cardStyles.metaValue}>
                        {architect.projectCount}
                      </span>
                    </div>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>פרופיל:</span>
                      <span className={cardStyles.metaValue}>
                        {architect.profileFilledCount}/{architect.profileTotalCount}
                      </span>
                    </div>
                  </div>

                  <div className={cardStyles.actions}>
                    <Button
                      href={`/admin/architects/${architect.id}`}
                      variant="secondary"
                      size="sm"
                    >
                      פתיחה
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <AdminArchitectsPagination
        params={params}
        page={result.page}
        totalPages={result.totalPages}
      />
    </AdminPage>
  );
}
