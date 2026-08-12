import type { Metadata } from "next";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminUsersPagination from "@/components/admin/AdminUsersPagination/AdminUsersPagination";
import AdminUsersToolbar from "@/components/admin/AdminUsersToolbar/AdminUsersToolbar";
import UserRowActions from "@/components/admin/UserRowActions/UserRowActions";
import { getAdminUsers } from "@/lib/users/getAdminUsers";
import { parseAdminUsersParams } from "@/lib/users/user-params";
import { USER_ROLE_LABELS } from "@/types/admin-user";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "משתמשים | Paper & Stone",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type AdminUsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const resolvedSearchParams = await searchParams;
  const params = parseAdminUsersParams(resolvedSearchParams);
  const result = await getAdminUsers(params);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>משתמשים</h1>
          <p className={styles.description}>
            ניהול משתמשים רשומים, תפקידים וסטטוס פעילות.
          </p>
        </div>
      </header>

      <AdminUsersToolbar params={params} total={result.total} />

      {result.users.length === 0 ? (
        <p className={styles.empty}>לא נמצאו משתמשים.</p>
      ) : (
        <>
          <div className={styles.desktopOnly}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">אימייל</th>
                    <th scope="col">תפקיד</th>
                    <th scope="col">סטטוס</th>
                    <th scope="col">נרשם</th>
                    <th scope="col">עודכן</th>
                    <th scope="col">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {result.users.map((user) => (
                    <tr key={user.id}>
                      <td dir="ltr">{user.email}</td>
                      <td>{USER_ROLE_LABELS[user.role]}</td>
                      <td>
                        <AdminStatusBadge
                          active={user.isActive}
                          labelOn="פעיל"
                          labelOff="לא פעיל"
                        />
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>{formatDate(user.updatedAt)}</td>
                      <td>
                        <UserRowActions user={user} layout="table" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ul className={`${styles.mobileOnly} ${styles.cardList}`}>
            {result.users.map((user) => (
              <li key={user.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <p className={styles.cardEmail} dir="ltr">
                    {user.email}
                  </p>
                </div>

                <div className={styles.cardMeta}>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>תפקיד:</span>
                    <span className={styles.metaValue}>
                      {USER_ROLE_LABELS[user.role]}
                    </span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>סטטוס:</span>
                    <AdminStatusBadge
                      active={user.isActive}
                      labelOn="פעיל"
                      labelOff="לא פעיל"
                    />
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>נרשם:</span>
                    <span className={styles.metaValue}>
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>עודכן:</span>
                    <span className={styles.metaValue}>
                      {formatDate(user.updatedAt)}
                    </span>
                  </div>
                </div>

                <UserRowActions user={user} layout="card" />
              </li>
            ))}
          </ul>
        </>
      )}

      <AdminUsersPagination
        params={params}
        page={result.page}
        totalPages={result.totalPages}
      />
    </div>
  );
}
