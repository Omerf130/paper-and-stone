import type { Metadata } from "next";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import ClientRequestRowActions from "@/components/admin/ClientRequestRowActions/ClientRequestRowActions";
import cardStyles from "@/components/admin/list/admin-list-card.module.scss";
import layoutStyles from "@/components/admin/list/admin-list-layout.module.scss";
import tableStyles from "@/components/admin/list/admin-table.module.scss";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { getPendingClientRequests } from "@/lib/users/client-request-queries";
import { formatDateTime } from "@/lib/ui/format-date-time";
import { USER_ROLE_LABELS } from "@/types/admin-user";
import { getAccountStatusLabel } from "@/lib/users/account-status";

export const metadata: Metadata = {
  title: "בקשות לקוח | Paper & Stone",
};

export default async function AdminClientRequestsPage() {
  const requests = await getPendingClientRequests();

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title="בקשות לקוח"
        description="משתמשים שנרשמו כלקוחות וממתינים לאישור מנהל המערכת"
      />

      {requests.length === 0 ? (
        <EmptyState title="אין כרגע בקשות לקוח ממתינות" />
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
                    <th scope="col">נרשם</th>
                    <th scope="col">תפקיד</th>
                    <th scope="col">סטטוס חשבון</th>
                    <th scope="col">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className={tableStyles.primary}>
                        {request.fullName ?? "—"}
                      </td>
                      <td dir="ltr">{request.email}</td>
                      <td>{request.identificationNumber ?? "—"}</td>
                      <td>{formatDateTime(request.createdAt)}</td>
                      <td>{USER_ROLE_LABELS[request.role]}</td>
                      <td>
                        <StatusBadge tone="warning">
                          {getAccountStatusLabel(request.accountStatus)}
                        </StatusBadge>
                      </td>
                      <td className={tableStyles.actions}>
                        <ClientRequestRowActions
                          request={request}
                          layout="table"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ul className={`${layoutStyles.mobileOnlyDesktop} ${cardStyles.list}`}>
            {requests.map((request) => (
              <li key={request.id} className={cardStyles.card}>
                <div className={cardStyles.header}>
                  <p className={cardStyles.title}>
                    {request.fullName ?? request.email}
                  </p>
                  <p className={cardStyles.subtitle} dir="ltr">
                    {request.email}
                  </p>
                </div>

                <div className={cardStyles.badges}>
                  <StatusBadge tone="warning">
                    {getAccountStatusLabel(request.accountStatus)}
                  </StatusBadge>
                </div>

                <div className={cardStyles.metaGrid}>
                  <div className={cardStyles.metaRow}>
                    <span className={cardStyles.metaLabel}>ח.פ / ת.ז:</span>
                    <span className={cardStyles.metaValue}>
                      {request.identificationNumber ?? "—"}
                    </span>
                  </div>
                  <div className={cardStyles.metaRow}>
                    <span className={cardStyles.metaLabel}>תפקיד:</span>
                    <span className={cardStyles.metaValue}>
                      {USER_ROLE_LABELS[request.role]}
                    </span>
                  </div>
                  <div className={cardStyles.metaRow}>
                    <span className={cardStyles.metaLabel}>נרשם:</span>
                    <span className={cardStyles.metaValue}>
                      {formatDateTime(request.createdAt)}
                    </span>
                  </div>
                </div>

                <ClientRequestRowActions request={request} layout="card" />
              </li>
            ))}
          </ul>
        </>
      )}
    </AdminPage>
  );
}
