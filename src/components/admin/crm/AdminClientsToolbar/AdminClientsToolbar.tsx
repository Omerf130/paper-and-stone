import Link from "next/link";
import {
  buildAdminClientsHref,
  type AdminClientsParams,
} from "@/lib/admin/crm/crm-params";
import { ACCOUNT_STATUS_LABELS } from "@/lib/users/account-status";
import AdminCrmWorkspaceTabs from "@/components/admin/crm/AdminCrmWorkspaceTabs/AdminCrmWorkspaceTabs";
import Button from "@/components/ui/Button/Button";
import styles from "@/components/admin/list/admin-list-toolbar.module.scss";

type AdminClientsToolbarProps = {
  params: AdminClientsParams;
  total: number;
  pendingRequestCount?: number;
};

const ACCOUNT_STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "הכל" },
  { value: "pending", label: ACCOUNT_STATUS_LABELS.pending },
  { value: "approved", label: ACCOUNT_STATUS_LABELS.approved },
  { value: "rejected", label: ACCOUNT_STATUS_LABELS.rejected },
];

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "הכל" },
  { value: "active", label: "פעילים" },
  { value: "inactive", label: "לא פעילים" },
];

export default function AdminClientsToolbar({
  params,
  total,
  pendingRequestCount = 0,
}: AdminClientsToolbarProps) {
  const hasFilters = Boolean(
    params.query || params.accountStatus || params.status,
  );
  const listHref = buildAdminClientsHref({
    query: params.query,
    accountStatus: params.accountStatus,
    status: params.status,
  });

  return (
    <section className={styles.toolbar} aria-label="סינון לקוחות">
      <AdminCrmWorkspaceTabs
        workspace="clients"
        activeTab="list"
        listHref={listHref}
        pendingRequestCount={pendingRequestCount}
      />

      <form method="get" className={styles.form}>
        <div className={styles.filters}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="clients-search">
              חיפוש
            </label>
            <input
              id="clients-search"
              name="q"
              type="search"
              className={styles.input}
              defaultValue={params.query ?? ""}
              placeholder="שם, אימייל או מזהה"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="clients-account-status">
              סטטוס חשבון
            </label>
            <select
              id="clients-account-status"
              name="accountStatus"
              className={styles.select}
              defaultValue={params.accountStatus ?? ""}
            >
              {ACCOUNT_STATUS_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="clients-status">
              פעילות
            </label>
            <select
              id="clients-status"
              name="status"
              className={styles.select}
              defaultValue={params.status ?? ""}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="submit" variant="secondary" size="sm">
            סינון
          </Button>
          {hasFilters ? (
            <Link href="/admin/clients" className={styles.resetLink}>
              ניקוי סינון
            </Link>
          ) : null}
        </div>
      </form>

      <p className={styles.summary}>{total} לקוחות</p>
    </section>
  );
}
