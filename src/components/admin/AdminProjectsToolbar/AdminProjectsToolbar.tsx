"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, type ChangeEvent } from "react";
import {
  ADMIN_PROJECTS_QUEUE_LABELS,
  hasAdminProjectsFilters,
  type AdminProjectsParams,
} from "@/lib/projects/project-params";
import type { AdminProjectsFilterOption } from "@/lib/projects/admin-projects-filter-options";
import { PROJECT_STATUS_LABELS } from "@/types/admin-project";
import type { ProjectStatus } from "@/types/project";
import styles from "./AdminProjectsToolbar.module.scss";

type AdminProjectsToolbarProps = {
  params: AdminProjectsParams;
  clientOptions: AdminProjectsFilterOption[];
  architectOptions: AdminProjectsFilterOption[];
};

const COMMERCIAL_STATUS_OPTIONS: Array<{ value: ProjectStatus; label: string }> = [
  { value: "submitted", label: PROJECT_STATUS_LABELS.submitted },
  { value: "changes_requested", label: PROJECT_STATUS_LABELS.changes_requested },
  { value: "approved", label: PROJECT_STATUS_LABELS.approved },
  { value: "rejected", label: PROJECT_STATUS_LABELS.rejected },
  { value: "draft", label: PROJECT_STATUS_LABELS.draft },
];

const QUEUE_OPTIONS = [
  "all",
  "attention",
  "active",
  "commercial",
  "onboarding",
] as const;

export default function AdminProjectsToolbar({
  params,
  clientOptions,
  architectOptions,
}: AdminProjectsToolbarProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const showReset = hasAdminProjectsFilters(params);

  function navigateTo(href: string) {
    startTransition(() => {
      router.push(href);
    });
  }

  function handleSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const form = event.currentTarget.form;
    if (!form) {
      return;
    }

    const formData = new FormData(form);
    const nextParams = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value.trim()) {
        nextParams.set(key, value);
      }
    }

    const href = nextParams.toString()
      ? `/admin/projects?${nextParams.toString()}`
      : "/admin/projects";

    navigateTo(href);
  }

  return (
    <div className={styles.toolbar} aria-label="סינון פרויקטים">
      <form method="get" className={styles.form}>
        <div className={styles.searchWrap}>
          <label className={styles.srOnly} htmlFor="projects-search">
            חיפוש
          </label>
          <input
            id="projects-search"
            name="q"
            type="search"
            className={styles.search}
            defaultValue={params.query ?? ""}
            placeholder="חיפוש פרויקטים..."
          />
        </div>

        <div className={styles.selectWrap}>
          <label className={styles.srOnly} htmlFor="projects-queue">
            סטטוס
          </label>
          <select
            id="projects-queue"
            name="queue"
            className={styles.select}
            defaultValue={params.queue}
            onChange={handleSelectChange}
          >
            {QUEUE_OPTIONS.map((queue) => (
              <option key={queue} value={queue}>
                {ADMIN_PROJECTS_QUEUE_LABELS[queue]}
              </option>
            ))}
          </select>
        </div>

        {params.queue === "commercial" ? (
          <div className={styles.selectWrap}>
            <label className={styles.srOnly} htmlFor="projects-status">
              סטטוס מסחרי
            </label>
            <select
              id="projects-status"
              name="status"
              className={styles.select}
              defaultValue={params.status}
              onChange={handleSelectChange}
            >
              {COMMERCIAL_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className={styles.selectWrap}>
          <label className={styles.srOnly} htmlFor="projects-client">
            לקוח
          </label>
          <select
            id="projects-client"
            name="clientId"
            className={styles.select}
            defaultValue={params.clientId ?? ""}
            onChange={handleSelectChange}
          >
            <option value="">כל הלקוחות</option>
            {clientOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectWrap}>
          <label className={styles.srOnly} htmlFor="projects-architect">
            אדריכל
          </label>
          <select
            id="projects-architect"
            name="architectId"
            className={styles.select}
            defaultValue={params.architectId ?? ""}
            onChange={handleSelectChange}
          >
            <option value="">כל האדריכלים</option>
            {architectOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {showReset ? (
          <Link href="/admin/projects" className={styles.resetLink}>
            איפוס
          </Link>
        ) : null}
      </form>
    </div>
  );
}
