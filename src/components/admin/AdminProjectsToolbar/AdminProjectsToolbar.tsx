import Link from "next/link";
import {
  type AdminProjectsParams,
} from "@/lib/projects/project-params";
import { PROJECT_STATUS_LABELS } from "@/types/admin-project";
import type { ProjectStatus } from "@/types/project";
import Button from "@/components/ui/Button/Button";
import styles from "@/components/admin/list/admin-list-toolbar.module.scss";

type AdminProjectsToolbarProps = {
  params: AdminProjectsParams;
  total: number;
};

const STATUS_OPTIONS: Array<{ value: ProjectStatus; label: string }> = [
  { value: "submitted", label: PROJECT_STATUS_LABELS.submitted },
  { value: "changes_requested", label: PROJECT_STATUS_LABELS.changes_requested },
  { value: "approved", label: PROJECT_STATUS_LABELS.approved },
  { value: "rejected", label: PROJECT_STATUS_LABELS.rejected },
  { value: "draft", label: PROJECT_STATUS_LABELS.draft },
];

export default function AdminProjectsToolbar({
  params,
  total,
}: AdminProjectsToolbarProps) {
  const hasFilters = Boolean(params.query || params.status !== "submitted");

  return (
    <section className={styles.toolbar} aria-label="סינון פרויקטים">
      <form method="get" className={styles.form}>
        <div className={styles.filters}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="projects-search">
              חיפוש
            </label>
            <input
              id="projects-search"
              name="q"
              type="search"
              className={styles.input}
              defaultValue={params.query ?? ""}
              placeholder="שם פרויקט, לקוח או אימייל"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="projects-status">
              סטטוס
            </label>
            <select
              id="projects-status"
              name="status"
              className={styles.select}
              defaultValue={params.status}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
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
            <Link href="/admin/projects" className={styles.resetLink}>
              ניקוי סינון
            </Link>
          ) : null}
        </div>
      </form>

      <p className={styles.summary}>
        {total} פרויקטים · {PROJECT_STATUS_LABELS[params.status]}
      </p>
    </section>
  );
}
