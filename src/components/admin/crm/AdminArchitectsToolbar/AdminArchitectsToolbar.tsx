import Link from "next/link";
import {
  buildAdminArchitectsHref,
  type AdminArchitectsParams,
} from "@/lib/admin/crm/crm-params";
import AdminCrmWorkspaceTabs from "@/components/admin/crm/AdminCrmWorkspaceTabs/AdminCrmWorkspaceTabs";
import Button from "@/components/ui/Button/Button";
import styles from "@/components/admin/list/admin-list-toolbar.module.scss";

type AdminArchitectsToolbarProps = {
  params: AdminArchitectsParams;
  total: number;
  pendingRequestCount?: number;
};

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "הכל" },
  { value: "active", label: "פעילים" },
  { value: "inactive", label: "לא פעילים" },
];

export default function AdminArchitectsToolbar({
  params,
  total,
  pendingRequestCount = 0,
}: AdminArchitectsToolbarProps) {
  const hasFilters = Boolean(params.query || params.status);
  const listHref = buildAdminArchitectsHref({
    query: params.query,
    status: params.status,
  });

  return (
    <section className={styles.toolbar} aria-label="סינון אדריכלים">
      <AdminCrmWorkspaceTabs
        workspace="architects"
        activeTab="list"
        listHref={listHref}
        pendingRequestCount={pendingRequestCount}
      />

      <form method="get" className={styles.form}>
        <div className={styles.filters}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="architects-search">
              חיפוש
            </label>
            <input
              id="architects-search"
              name="q"
              type="search"
              className={styles.input}
              defaultValue={params.query ?? ""}
              placeholder="שם, אימייל או מזהה"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="architects-status">
              פעילות
            </label>
            <select
              id="architects-status"
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
            <Link href="/admin/architects" className={styles.resetLink}>
              ניקוי סינון
            </Link>
          ) : null}
        </div>
      </form>

      <p className={styles.summary}>{total} אדריכלים</p>
    </section>
  );
}
