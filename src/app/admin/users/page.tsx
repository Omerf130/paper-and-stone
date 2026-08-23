import type { Metadata } from "next";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import AdminUsersPagination from "@/components/admin/AdminUsersPagination/AdminUsersPagination";
import AdminUsersToolbar from "@/components/admin/AdminUsersToolbar/AdminUsersToolbar";
import UserRowActions from "@/components/admin/UserRowActions/UserRowActions";
import cardStyles from "@/components/admin/list/admin-list-card.module.scss";
import layoutStyles from "@/components/admin/list/admin-list-layout.module.scss";
import tableStyles from "@/components/admin/list/admin-table.module.scss";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { getAdminUsers } from "@/lib/users/getAdminUsers";
import { parseAdminUsersParams } from "@/lib/users/user-params";
import { formatDateTime } from "@/lib/ui/format-date-time";
import { mapEntityActiveToBadge } from "@/lib/ui/map-status-badge";
import { mapAccountStatusToBadge } from "@/lib/ui/map-account-status-badge";
import {
  REQUESTED_ROLE_LABEL,
  USER_ROLE_LABELS,
} from "@/types/admin-user";

export const metadata: Metadata = {
  title: "משתמשים | Paper & Stone",
};

type AdminUsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function hasUserFilters(params: ReturnType<typeof parseAdminUsersParams>): boolean {
  return Boolean(params.query || params.role || params.status);
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const resolvedSearchParams = await searchParams;
  const params = parseAdminUsersParams(resolvedSearchParams);
  const result = await getAdminUsers(params);
  const filtered = hasUserFilters(params);

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title="משתמשים"
        description="ניהול משתמשי המערכת והרשאות"
      />

      <AdminUsersToolbar params={params} total={result.total} />

      {result.users.length === 0 ? (
        <EmptyState
          title={
            filtered
              ? "לא נמצאו משתמשים שמתאימים לחיפוש"
              : "אין עדיין משתמשים רשומים"
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
                    <th scope="col">תפקיד</th>
                    <th scope="col">סטטוס חשבון</th>
                    <th scope="col">פעילות</th>
                    <th scope="col">נרשם</th>
                    <th scope="col">עודכן</th>
                    <th scope="col">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {result.users.map((user) => {
                    const activeStatus = mapEntityActiveToBadge(user.isActive);
                    const accountStatus = mapAccountStatusToBadge(user.accountStatus);

                    return (
                      <tr key={user.id}>
                        <td className={tableStyles.primary}>
                          {user.fullName ?? "—"}
                        </td>
                        <td dir="ltr">{user.email}</td>
                        <td>
                          <span>{USER_ROLE_LABELS[user.role]}</span>
                          {user.requestedRole === "architect" ? (
                            <>
                              {" "}
                              <StatusBadge tone="warning">
                                {REQUESTED_ROLE_LABEL}
                              </StatusBadge>
                            </>
                          ) : null}
                        </td>
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
                        <td>{formatDateTime(user.createdAt)}</td>
                        <td>{formatDateTime(user.updatedAt)}</td>
                        <td className={tableStyles.actions}>
                          <UserRowActions user={user} layout="table" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <ul className={`${layoutStyles.mobileOnlyDesktop} ${cardStyles.list}`}>
            {result.users.map((user) => {
              const activeStatus = mapEntityActiveToBadge(user.isActive);
              const accountStatus = mapAccountStatusToBadge(user.accountStatus);

              return (
                <li key={user.id} className={cardStyles.card}>
                  <div className={cardStyles.header}>
                    <p className={cardStyles.title}>
                      {user.fullName ?? user.email}
                    </p>
                    <p className={cardStyles.subtitle} dir="ltr">
                      {user.email}
                    </p>
                  </div>

                  <div className={cardStyles.badges}>
                    <StatusBadge tone={accountStatus.tone}>
                      {accountStatus.label}
                    </StatusBadge>
                    <StatusBadge tone={activeStatus.tone}>
                      {activeStatus.label}
                    </StatusBadge>
                    {user.requestedRole === "architect" ? (
                      <StatusBadge tone="warning">
                        {REQUESTED_ROLE_LABEL}
                      </StatusBadge>
                    ) : null}
                  </div>

                  <div className={cardStyles.metaGrid}>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>תפקיד:</span>
                      <span className={cardStyles.metaValue}>
                        {USER_ROLE_LABELS[user.role]}
                      </span>
                    </div>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>נרשם:</span>
                      <span className={cardStyles.metaValue}>
                        {formatDateTime(user.createdAt)}
                      </span>
                    </div>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>עודכן:</span>
                      <span className={cardStyles.metaValue}>
                        {formatDateTime(user.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <UserRowActions user={user} layout="card" />
                </li>
              );
            })}
          </ul>
        </>
      )}

      <AdminUsersPagination
        params={params}
        page={result.page}
        totalPages={result.totalPages}
      />
    </AdminPage>
  );
}
