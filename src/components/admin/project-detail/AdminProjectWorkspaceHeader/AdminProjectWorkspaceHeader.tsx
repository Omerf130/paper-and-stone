"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AdminProjectArchitectReassignPanel from "@/components/admin/project-detail/AdminProjectArchitectReassignPanel/AdminProjectArchitectReassignPanel";
import AdminProjectDetailBreadcrumb from "@/components/admin/project-detail/AdminProjectDetailBreadcrumb/AdminProjectDetailBreadcrumb";
import ProjectClientReassignPanel from "@/components/admin/project-detail/ProjectClientReassignPanel/ProjectClientReassignPanel";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import Button from "@/components/ui/Button/Button";
import type { AdminProjectDetailWithThumbnails } from "@/lib/projects/getAdminProjects";
import {
  mapOnboardingStatusToBadge,
  mapProjectStatusToBadge,
} from "@/lib/ui/map-status-badge";
import { formatRelativeTime } from "@/lib/ui/format-relative-time";
import { formatDateTime } from "@/lib/ui/format-date-time";
import dialogStyles from "@/components/professional/projects/project-room-dialog.module.scss";
import styles from "./AdminProjectWorkspaceHeader.module.scss";

type AdminProjectWorkspaceHeaderProps = {
  project: AdminProjectDetailWithThumbnails;
};

function MetaIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className={styles.metaIcon} aria-hidden="true">
      {children}
    </span>
  );
}

function resolveSecondaryIndicator(project: AdminProjectDetailWithThumbnails): string | null {
  if (project.status === "approved" && project.commercialDirty) {
    return "אושר בעבר · השתנה מאז";
  }

  if (project.attentionReasons[0]) {
    return project.attentionReasons[0];
  }

  if (project.pricingAttention.incompleteItemCount > 0) {
    return `${project.pricingAttention.incompleteItemCount} ללא תמחור מלא`;
  }

  if (project.pricingAttention.needsReviewItemCount > 0) {
    return `${project.pricingAttention.needsReviewItemCount} דורשים בדיקת תמחור`;
  }

  return project.workflowAttentionSummary?.[0]?.label ?? null;
}

export default function AdminProjectWorkspaceHeader({
  project,
}: AdminProjectWorkspaceHeaderProps) {
  const clientDialogRef = useRef<HTMLDialogElement>(null);
  const architectDialogRef = useRef<HTMLDialogElement>(null);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [architectDialogOpen, setArchitectDialogOpen] = useState(false);
  const actionsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const dialog = clientDialogRef.current;
    if (!dialog) {
      return;
    }

    if (clientDialogOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!clientDialogOpen && dialog.open) {
      dialog.close();
    }
  }, [clientDialogOpen]);

  useEffect(() => {
    const dialog = architectDialogRef.current;
    if (!dialog) {
      return;
    }

    if (architectDialogOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!architectDialogOpen && dialog.open) {
      dialog.close();
    }
  }, [architectDialogOpen]);

  useEffect(() => {
    const dialog = clientDialogRef.current;
    if (!dialog) {
      return;
    }

    const handleClose = () => setClientDialogOpen(false);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  useEffect(() => {
    const dialog = architectDialogRef.current;
    if (!dialog) {
      return;
    }

    const handleClose = () => setArchitectDialogOpen(false);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  const onboardingStatus = project.onboardingStatus;
  const showOnboardingStatus =
    onboardingStatus === "pending_approval" || onboardingStatus === "rejected";
  const onboardingBadge =
    showOnboardingStatus && onboardingStatus
      ? mapOnboardingStatusToBadge(onboardingStatus)
      : null;
  const commercialBadge = mapProjectStatusToBadge(project.status);
  const secondaryIndicator = resolveSecondaryIndicator(project);
  const clientLabel = project.assignedClientFullName ?? project.clientName ?? "—";
  const architectLabel = project.professionalName ?? project.professionalEmail;
  const updatedLabel =
    formatRelativeTime(project.updatedAt, "") || formatDateTime(project.updatedAt);

  const closeActionsMenu = () => {
    if (actionsRef.current) {
      actionsRef.current.open = false;
    }
  };

  return (
    <>
      <header className={styles.header}>
        <AdminProjectDetailBreadcrumb projectName={project.name} />

        <div className={styles.primaryRow}>
          <div className={styles.identity}>
            <h1 className={styles.projectName}>{project.name}</h1>
          </div>

          <div className={styles.headerAside}>
            <div className={styles.statusBlock}>
              <span className={styles.statusLabel}>סטטוס פרויקט</span>
              {onboardingBadge ? (
                <StatusBadge tone={onboardingBadge.tone}>
                  {onboardingBadge.label}
                </StatusBadge>
              ) : (
                <StatusBadge tone={commercialBadge.tone}>
                  {commercialBadge.label}
                </StatusBadge>
              )}
              {secondaryIndicator ? (
                <span className={styles.statusSecondary}>{secondaryIndicator}</span>
              ) : null}
            </div>

            <details ref={actionsRef} className={styles.actionsMenu}>
              <summary className={styles.actionsTrigger}>פעולות</summary>
              <div className={styles.actionsPanel} role="menu">
                <Link
                  href="/admin/projects?queue=active"
                  className={styles.actionsItem}
                  onClick={closeActionsMenu}
                >
                  חזרה לפרויקטים
                </Link>
                <button
                  type="button"
                  className={styles.actionsItem}
                  onClick={() => {
                    closeActionsMenu();
                    setClientDialogOpen(true);
                  }}
                >
                  שיוך לקוח
                </button>
                <button
                  type="button"
                  className={styles.actionsItem}
                  onClick={() => {
                    closeActionsMenu();
                    setArchitectDialogOpen(true);
                  }}
                >
                  פרטי אדריכל
                </button>
              </div>
            </details>
          </div>
        </div>

        <div className={styles.metaRow}>
          <span className={styles.metaStat}>
            <MetaIcon>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="4" r="2.25" stroke="currentColor" strokeWidth="1" />
                <path
                  d="M2.5 10.5c0-1.933 1.567-3.5 3.5-3.5s3.5 1.567 3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
            </MetaIcon>
            {clientLabel}
          </span>

          {project.location ? (
            <span className={styles.metaStat}>
              <MetaIcon>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 1.5c-1.933 0-3.5 1.567-3.5 3.5 0 2.625 3.5 5.5 3.5 5.5s3.5-2.875 3.5-5.5c0-1.933-1.567-3.5-3.5-3.5Z"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                  <circle cx="6" cy="5" r="1" fill="currentColor" />
                </svg>
              </MetaIcon>
              {project.location}
            </span>
          ) : null}

          <span className={styles.metaStat}>
            <MetaIcon>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect
                  x="2"
                  y="2.5"
                  width="8"
                  height="7"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <path d="M4 1.5v2M8 1.5v2M2 5h8" stroke="currentColor" strokeWidth="1" />
              </svg>
            </MetaIcon>
            {architectLabel}
          </span>

          <span className={styles.metaStat}>
            <MetaIcon>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect
                  x="2"
                  y="2.5"
                  width="8"
                  height="7"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <path d="M2 5h8M5 2.5v7M7 2.5v7" stroke="currentColor" strokeWidth="1" />
              </svg>
            </MetaIcon>
            <time dateTime={project.updatedAt}>עודכן {updatedLabel}</time>
          </span>
        </div>
      </header>

      <dialog
        ref={clientDialogRef}
        className={dialogStyles.dialog}
        aria-labelledby="client-details-title"
      >
        <div className={dialogStyles.panel}>
          <header className={dialogStyles.header}>
            <h2 id="client-details-title" className={dialogStyles.title}>
              לקוח
            </h2>
            <button
              type="button"
              className={dialogStyles.closeButton}
              aria-label="סגירה"
              onClick={() => setClientDialogOpen(false)}
            >
              ×
            </button>
          </header>

          <dl className={styles.detailList}>
            <div>
              <dt>שם</dt>
              <dd>{clientLabel}</dd>
            </div>
            {project.clientUserId ? (
              <div>
                <dt>מזהה משתמש</dt>
                <dd dir="ltr">{project.clientUserId}</dd>
              </div>
            ) : null}
          </dl>

          <ProjectClientReassignPanel project={project} embedded />

          <div className={dialogStyles.actions}>
            <Button variant="secondary" onClick={() => setClientDialogOpen(false)}>
              סגירה
            </Button>
          </div>
        </div>
      </dialog>

      <dialog
        ref={architectDialogRef}
        className={dialogStyles.dialog}
        aria-labelledby="architect-details-title"
      >
        <div className={dialogStyles.panel}>
          <header className={dialogStyles.header}>
            <h2 id="architect-details-title" className={dialogStyles.title}>
              אדריכל
            </h2>
            <button
              type="button"
              className={dialogStyles.closeButton}
              aria-label="סגירה"
              onClick={() => setArchitectDialogOpen(false)}
            >
              ×
            </button>
          </header>

          <dl className={styles.detailList}>
            <div>
              <dt>שם</dt>
              <dd>{project.professionalName ?? "—"}</dd>
            </div>
            <div>
              <dt>אימייל</dt>
              <dd dir="ltr">{project.professionalEmail}</dd>
            </div>
          </dl>

          <AdminProjectArchitectReassignPanel
            project={project}
            currentArchitectLabel={project.professionalName ?? project.professionalEmail}
            embedded
          />

          <div className={dialogStyles.actions}>
            <Button variant="secondary" onClick={() => setArchitectDialogOpen(false)}>
              סגירה
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
