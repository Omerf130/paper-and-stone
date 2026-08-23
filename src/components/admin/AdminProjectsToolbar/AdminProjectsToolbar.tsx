import Link from "next/link";
import {
  ADMIN_PROJECTS_QUEUE_LABELS,
  buildAdminProjectsHref,
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

const COMMERCIAL_STATUS_OPTIONS: Array<{ value: ProjectStatus; label: string }> = [
  { value: "submitted", label: PROJECT_STATUS_LABELS.submitted },
  { value: "changes_requested", label: PROJECT_STATUS_LABELS.changes_requested },
  { value: "approved", label: PROJECT_STATUS_LABELS.approved },
  { value: "rejected", label: PROJECT_STATUS_LABELS.rejected },
  { value: "draft", label: PROJECT_STATUS_LABELS.draft },
];

const QUEUE_TABS = [
  "all",
  "attention",
  "active",
  "commercial",
  "onboarding",
] as const;

export default function AdminProjectsToolbar({
  params,
  total,
}: AdminProjectsToolbarProps) {
  const hasFilters = Boolean(
    params.query || (params.queue === "commercial" && params.status !== "submitted"),
  );

  return (
    <section className={styles.toolbar} aria-label="סינון פרויקטים">
      <nav className={styles.queueTabs} aria-label="תצוגות פרויקט">
        {QUEUE_TABS.map((queue) => (
          <Link
            key={queue}
            href={buildAdminProjectsHref({
              query: params.query,
              queue,
              status: params.queue === "commercial" ? params.status : undefined,
            })}
            className={
              params.queue === queue ? styles.queueTabActive : styles.queueTab
            }
            aria-current={params.queue === queue ? "page" : undefined}
          >
            {ADMIN_PROJECTS_QUEUE_LABELS[queue]}
          </Link>
        ))}
      </nav>

      <form method="get" className={styles.form}>
        {params.queue !== "attention" ? (
          <input type="hidden" name="queue" value={params.queue} />
        ) : null}

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
              placeholder="שם פרויקט, אדריכל, לקוח או אימייל"
            />
          </div>

          {params.queue === "commercial" ? (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="projects-status">
                סטטוס מסחרי
              </label>
              <select
                id="projects-status"
                name="status"
                className={styles.select}
                defaultValue={params.status}
              >
                {COMMERCIAL_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <div className={styles.actions}>
          <Button type="submit" variant="secondary" size="sm">
            חיפוש
          </Button>
          {hasFilters ? (
            <Link
              href={buildAdminProjectsHref({ queue: params.queue })}
              className={styles.resetLink}
            >
              ניקוי סינון
            </Link>
          ) : null}
        </div>
      </form>

      <p className={styles.summary}>
        {total} פרויקטים · {ADMIN_PROJECTS_QUEUE_LABELS[params.queue]}
        {params.queue === "commercial"
          ? ` · ${PROJECT_STATUS_LABELS[params.status]}`
          : ""}
      </p>
    </section>
  );
}
