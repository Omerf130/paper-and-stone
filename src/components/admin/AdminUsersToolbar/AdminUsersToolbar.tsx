import Link from "next/link";
import {
  type AdminUsersParams,
} from "@/lib/users/user-params";
import { USER_ROLE_LABELS } from "@/types/admin-user";
import Button from "@/components/ui/Button/Button";
import styles from "@/components/admin/list/admin-list-toolbar.module.scss";

type AdminUsersToolbarProps = {
  params: AdminUsersParams;
  total: number;
};

const ROLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "הכל" },
  { value: "customer", label: "לקוחות" },
  { value: "professional", label: "אנשי מקצוע" },
  { value: "admin", label: "אדמינים" },
];

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "הכל" },
  { value: "active", label: "פעילים" },
  { value: "inactive", label: "לא פעילים" },
];

export default function AdminUsersToolbar({
  params,
  total,
}: AdminUsersToolbarProps) {
  const hasFilters = Boolean(params.query || params.role || params.status);

  return (
    <section className={styles.toolbar} aria-label="סינון משתמשים">
      <form method="get" className={styles.form}>
        <div className={styles.filters}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="users-search">
              חיפוש לפי אימייל
            </label>
            <input
              id="users-search"
              name="q"
              type="search"
              className={styles.input}
              defaultValue={params.query ?? ""}
              placeholder="user@example.com"
              dir="ltr"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="users-role">
              תפקיד
            </label>
            <select
              id="users-role"
              name="role"
              className={styles.select}
              defaultValue={params.role ?? ""}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="users-status">
              סטטוס
            </label>
            <select
              id="users-status"
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
            <Link href="/admin/users" className={styles.resetLink}>
              ניקוי סינון
            </Link>
          ) : null}
        </div>
      </form>

      <p className={styles.summary}>
        {total} משתמשים
        {params.role ? ` · ${USER_ROLE_LABELS[params.role]}` : ""}
      </p>
    </section>
  );
}
