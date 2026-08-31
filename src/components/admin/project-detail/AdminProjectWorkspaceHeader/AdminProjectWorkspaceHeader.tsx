"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ProjectClientReassignPanel from "@/components/admin/project-detail/ProjectClientReassignPanel/ProjectClientReassignPanel";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import Button from "@/components/ui/Button/Button";
import type { AdminProjectDetailWithThumbnails } from "@/lib/projects/getAdminProjects";
import {
  mapOnboardingStatusToBadge,
  mapProjectStatusToBadge,
} from "@/lib/ui/map-status-badge";
import { formatDateTime } from "@/lib/ui/format-date-time";
import { ONBOARDING_STATUS_LABELS, PROJECT_STATUS_LABELS } from "@/types/admin-project";
import dialogStyles from "@/components/professional/projects/project-room-dialog.module.scss";
import styles from "./AdminProjectWorkspaceHeader.module.scss";

type AdminProjectWorkspaceHeaderProps = {
  project: AdminProjectDetailWithThumbnails;
};

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

  const onboardingBadge = project.onboardingStatus
    ? mapOnboardingStatusToBadge(project.onboardingStatus)
    : null;
  const commercialBadge = mapProjectStatusToBadge(project.status);
  const clientLabel = project.assignedClientFullName ?? project.clientName ?? "—";
  const architectLabel = project.professionalName ?? project.professionalEmail;

  const attentionBadges: Array<{ key: string; label: string }> = [];

  if (project.status === "approved" && project.commercialDirty) {
    attentionBadges.push({ key: "commercial-dirty", label: "אושר בעבר · השתנה מאז" });
  }

  for (const reason of project.attentionReasons) {
    attentionBadges.push({ key: reason, label: reason });
  }

  if (project.pricingAttention.incompleteItemCount > 0) {
    attentionBadges.push({
      key: "unpriced",
      label: `${project.pricingAttention.incompleteItemCount} ללא תמחור מלא`,
    });
  }

  if (project.pricingAttention.needsReviewItemCount > 0) {
    attentionBadges.push({
      key: "needs-review",
      label: `${project.pricingAttention.needsReviewItemCount} דורשים בדיקת תמחור`,
    });
  }

  for (const line of project.workflowAttentionSummary ?? []) {
    attentionBadges.push({ key: line.status, label: line.label });
  }

  const closeActionsMenu = () => {
    if (actionsRef.current) {
      actionsRef.current.open = false;
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.primaryRow}>
          <div className={styles.identity}>
            <h1 className={styles.projectName}>{project.name}</h1>
            <div className={styles.statusGroup}>
              {onboardingBadge ? (
                <StatusBadge tone={onboardingBadge.tone}>
                  {ONBOARDING_STATUS_LABELS[project.onboardingStatus!]}: {onboardingBadge.label}
                </StatusBadge>
              ) : null}
              <StatusBadge tone={commercialBadge.tone}>
                {PROJECT_STATUS_LABELS[project.status]}: {commercialBadge.label}
              </StatusBadge>
            </div>
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

        <div className={styles.metaRow}>
          <button
            type="button"
            className={styles.metaButton}
            onClick={() => setClientDialogOpen(true)}
          >
            <span className={styles.metaLabel}>לקוח</span>
            <span className={styles.metaValue}>{clientLabel}</span>
          </button>
          <span className={styles.metaDivider} aria-hidden="true">
            ·
          </span>
          <button
            type="button"
            className={styles.metaButton}
            onClick={() => setArchitectDialogOpen(true)}
          >
            <span className={styles.metaLabel}>אדריכל</span>
            <span className={styles.metaValue}>{architectLabel}</span>
          </button>
          <span className={styles.metaDivider} aria-hidden="true">
            ·
          </span>
          <span className={styles.metaStat}>
            {project.rooms.length} חדרים · {project.items.length} מוצרים · עודכן{" "}
            <time dateTime={project.updatedAt}>{formatDateTime(project.updatedAt)}</time>
          </span>

          {project.paymentSummaryCompact ? (
            <>
              <span className={styles.metaDivider} aria-hidden="true">
                ·
              </span>
              <span className={styles.metaStat}>
                תשלומים {project.paymentSummaryCompact}
              </span>
            </>
          ) : null}

          {project.logisticsInProgressCount != null &&
          project.logisticsInProgressCount > 0 ? (
            <>
              <span className={styles.metaDivider} aria-hidden="true">
                ·
              </span>
              <span className={styles.metaStat}>
                {project.logisticsInProgressCount} בלוגיסטיקה
              </span>
            </>
          ) : null}

          {attentionBadges.length > 0 ? (
            <div className={styles.attentionGroup} aria-label="דרוש טיפול">
              {attentionBadges.slice(0, 3).map((badge) => (
                <StatusBadge key={badge.key} tone="warning">
                  {badge.label}
                </StatusBadge>
              ))}
            </div>
          ) : null}
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
