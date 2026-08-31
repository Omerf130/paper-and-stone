"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminAddProductToProjectDialog from "@/components/admin/project-detail/AdminAddProductToProjectDialog/AdminAddProductToProjectDialog";
import AdminProjectItemsPanel from "@/components/admin/project-detail/AdminProjectItemsPanel/AdminProjectItemsPanel";
import AdminProjectReviewHistory from "@/components/admin/project-detail/AdminProjectReviewHistory/AdminProjectReviewHistory";
import AdminProjectRoomCreateDialog from "@/components/admin/project-detail/AdminProjectRoomCreateDialog/AdminProjectRoomCreateDialog";
import ProjectReviewPanel from "@/components/admin/ProjectReviewPanel/ProjectReviewPanel";
import Button from "@/components/ui/Button/Button";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { AdminProjectDetailWithThumbnails } from "@/lib/projects/getAdminProjects";
import styles from "./AdminProjectSummaryTab.module.scss";

type AdminProjectSummaryTabProps = {
  project: AdminProjectDetailWithThumbnails;
};

export default function AdminProjectSummaryTab({
  project,
}: AdminProjectSummaryTabProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const isEditable = project.isWorkspaceEditable;

  return (
    <div className={styles.tab}>
      <section className={styles.workspace} aria-labelledby="summary-workspace-title">
        <div className={styles.workspaceHeader}>
          <h2 id="summary-workspace-title" className={styles.workspaceTitle}>
            חדרים ומוצרים
          </h2>
          {isEditable ? (
            <div className={styles.toolbar}>
              <Button size="sm" onClick={() => setAddProductOpen(true)}>
                הוסף מוצר
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setCreateRoomOpen(true)}>
                הוסף חדר
              </Button>
            </div>
          ) : null}
        </div>

        <AdminProjectItemsPanel
          projectId={project.id}
          rooms={project.rooms}
          items={project.items}
          productThumbnailsById={project.productThumbnailsById}
          isEditable={isEditable}
        />
      </section>

      {project.status === "submitted" ? (
        <section className={styles.secondary} aria-labelledby="summary-review-title">
          <h3 id="summary-review-title" className={styles.secondaryTitle}>
            בדיקה מסחרית
          </h3>
          <ProjectReviewPanel
            projectId={project.id}
            status={project.status}
            approvalBlockedReason={
              project.pricingApprovalBlockedReason ?? undefined
            }
          />
        </section>
      ) : null}

      {project.reviewHistory.length > 0 ? (
        <section className={styles.secondary} aria-labelledby="summary-history-title">
          <h3 id="summary-history-title" className={styles.secondaryTitle}>
            היסטוריית בדיקות
          </h3>
          <AdminProjectReviewHistory history={project.reviewHistory} />
        </section>
      ) : null}

      <AdminAddProductToProjectDialog
        projectId={project.id}
        open={addProductOpen}
        onClose={() => setAddProductOpen(false)}
      />

      <AdminProjectRoomCreateDialog
        projectId={project.id}
        open={createRoomOpen}
        onClose={() => setCreateRoomOpen(false)}
        onCreated={() => {
          toast({ type: "success", message: "החדר נוצר" });
          router.refresh();
        }}
      />
    </div>
  );
}
