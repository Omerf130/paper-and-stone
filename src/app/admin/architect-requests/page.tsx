import type { Metadata } from "next";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import AdminCrmTabSection from "@/components/admin/crm/AdminCrmTabSection/AdminCrmTabSection";
import ArchitectRequestRowActions from "@/components/admin/ArchitectRequestRowActions/ArchitectRequestRowActions";
import cardStyles from "@/components/admin/list/admin-list-card.module.scss";
import layoutStyles from "@/components/admin/list/admin-list-layout.module.scss";
import tableStyles from "@/components/admin/list/admin-table.module.scss";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { getPendingArchitectRequests } from "@/lib/users/architect-request-queries";
import { formatDateTime } from "@/lib/ui/format-date-time";
import {
  REQUESTED_ROLE_LABEL,
  USER_ROLE_LABELS,
  USER_TYPE_LABELS,
} from "@/types/admin-user";

export const metadata: Metadata = {
  title: "אדריכלים | Paper & Stone",
};

export default async function AdminArchitectRequestsPage() {
  const requests = await getPendingArchitectRequests();
  const pendingRequestCount = requests.length;

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

      <AdminCrmTabSection
        workspace="architects"
        activeTab="requests"
        pendingRequestCount={pendingRequestCount}
        summary={
          pendingRequestCount > 0
            ? `${pendingRequestCount} בקשות ממתינות`
            : "אין בקשות ממתינות"
        }
      />

      {requests.length === 0 ? (
        <EmptyState title="אין כרגע בקשות אדריכל ממתינות" />
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
                    <th scope="col">תפקיד נוכחי</th>
                    <th scope="col">בקשה</th>
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
                          {USER_TYPE_LABELS.architect}
                        </StatusBadge>
                      </td>
                      <td className={tableStyles.actions}>
                        <ArchitectRequestRowActions
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
                  <StatusBadge tone="warning">{REQUESTED_ROLE_LABEL}</StatusBadge>
                </div>

                <div className={cardStyles.metaGrid}>
                  <div className={cardStyles.metaRow}>
                    <span className={cardStyles.metaLabel}>ח.פ / ת.ז:</span>
                    <span className={cardStyles.metaValue}>
                      {request.identificationNumber ?? "—"}
                    </span>
                  </div>
                  <div className={cardStyles.metaRow}>
                    <span className={cardStyles.metaLabel}>תפקיד נוכחי:</span>
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

                <ArchitectRequestRowActions request={request} layout="card" />
              </li>
            ))}
          </ul>
        </>
      )}
    </AdminPage>
  );
}
