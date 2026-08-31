import type { Metadata } from "next";
import Link from "next/link";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import AdminClientsPagination from "@/components/admin/crm/AdminClientsPagination/AdminClientsPagination";
import AdminClientsToolbar from "@/components/admin/crm/AdminClientsToolbar/AdminClientsToolbar";
import cardStyles from "@/components/admin/list/admin-list-card.module.scss";
import layoutStyles from "@/components/admin/list/admin-list-layout.module.scss";
import tableStyles from "@/components/admin/list/admin-table.module.scss";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { getAdminClients } from "@/lib/admin/clients/getAdminClients";
import { parseAdminClientsParams } from "@/lib/admin/crm/crm-params";
import { countPendingClientRequests } from "@/lib/users/client-request-queries";
import { formatDateTime } from "@/lib/ui/format-date-time";
import { mapAccountStatusToBadge } from "@/lib/ui/map-account-status-badge";
import { mapEntityActiveToBadge } from "@/lib/ui/map-status-badge";

export const metadata: Metadata = {
  title: "לקוחות | Paper & Stone",
};

type AdminClientsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function hasClientFilters(
  params: ReturnType<typeof parseAdminClientsParams>,
): boolean {
  return Boolean(params.query || params.accountStatus || params.status);
}

export default async function AdminClientsPage({
  searchParams,
}: AdminClientsPageProps) {
  const resolvedSearchParams = await searchParams;
  const params = parseAdminClientsParams(resolvedSearchParams);
  const [result, pendingRequestCount] = await Promise.all([
    getAdminClients(params),
    countPendingClientRequests(),
  ]);
  const filtered = hasClientFilters(params);

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title="לקוחות"
        description="ניהול לקוחות ופרויקטים משויכים"
        actions={
          <Button href="/admin/clients/new" size="sm">
            יצירת לקוח
          </Button>
        }
      />

      <AdminClientsToolbar
        params={params}
        total={result.total}
        pendingRequestCount={pendingRequestCount}
      />

      {result.clients.length === 0 ? (
        <EmptyState
          title={
            filtered
              ? "לא נמצאו לקוחות שמתאימים לחיפוש"
              : "אין עדיין לקוחות רשומים"
          }
          action={
            !filtered ? (
              <Button href="/admin/clients/new" size="sm">
                יצירת לקוח
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
                    <th scope="col">שם מלא</th>
                    <th scope="col">אימייל</th>
                    <th scope="col">ח.פ / ת.ז</th>
                    <th scope="col">סטטוס חשבון</th>
                    <th scope="col">פעילות</th>
                    <th scope="col">פרויקטים</th>
                    <th scope="col">נרשם</th>
                    <th scope="col">עודכן</th>
                    <th scope="col">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {result.clients.map((client) => {
                    const activeStatus = mapEntityActiveToBadge(client.isActive);
                    const accountStatus = mapAccountStatusToBadge(
                      client.accountStatus,
                    );

                    return (
                      <tr key={client.id}>
                        <td className={tableStyles.primary}>
                          {client.fullName ?? "—"}
                        </td>
                        <td dir="ltr">{client.email}</td>
                        <td>{client.identificationNumber ?? "—"}</td>
                        <td>
                          <StatusBadge tone={accountStatus.tone}>
                            {accountStatus.label}
                          </StatusBadge>
                        </td>
                        <td>
                          <StatusBadge tone={activeStatus.tone}>
                            {activeStatus.label}
                          </StatusBadge>
                        </td>
                        <td>{client.projectCount}</td>
                        <td>{formatDateTime(client.createdAt)}</td>
                        <td>{formatDateTime(client.updatedAt)}</td>
                        <td className={tableStyles.actions}>
                          <Link
                            href={`/admin/clients/${client.id}`}
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
            {result.clients.map((client) => {
              const activeStatus = mapEntityActiveToBadge(client.isActive);
              const accountStatus = mapAccountStatusToBadge(client.accountStatus);

              return (
                <li key={client.id} className={cardStyles.card}>
                  <div className={cardStyles.header}>
                    <p className={cardStyles.title}>
                      {client.fullName ?? client.email}
                    </p>
                    <p className={cardStyles.subtitle} dir="ltr">
                      {client.email}
                    </p>
                  </div>

                  <div className={cardStyles.badges}>
                    <StatusBadge tone={accountStatus.tone}>
                      {accountStatus.label}
                    </StatusBadge>
                    <StatusBadge tone={activeStatus.tone}>
                      {activeStatus.label}
                    </StatusBadge>
                  </div>

                  <div className={cardStyles.metaGrid}>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>ח.פ / ת.ז:</span>
                      <span className={cardStyles.metaValue}>
                        {client.identificationNumber ?? "—"}
                      </span>
                    </div>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>פרויקטים:</span>
                      <span className={cardStyles.metaValue}>
                        {client.projectCount}
                      </span>
                    </div>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>עודכן:</span>
                      <span className={cardStyles.metaValue}>
                        {formatDateTime(client.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <div className={cardStyles.actions}>
                    <Button
                      href={`/admin/clients/${client.id}`}
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

      <AdminClientsPagination
        params={params}
        page={result.page}
        totalPages={result.totalPages}
      />
    </AdminPage>
  );
}
