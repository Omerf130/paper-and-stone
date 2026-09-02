"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminAddProductToProjectDialog from "@/components/admin/project-detail/AdminAddProductToProjectDialog/AdminAddProductToProjectDialog";
import AdminProjectCommercialReviewBanner from "@/components/admin/project-detail/AdminProjectCommercialReviewBanner/AdminProjectCommercialReviewBanner";
import AdminProjectItemsPanel from "@/components/admin/project-detail/AdminProjectItemsPanel/AdminProjectItemsPanel";
import AdminProjectRoomCreateDialog from "@/components/admin/project-detail/AdminProjectRoomCreateDialog/AdminProjectRoomCreateDialog";
import AdminProjectWorkspaceBottomSummary from "@/components/admin/project-detail/AdminProjectWorkspaceBottomSummary/AdminProjectWorkspaceBottomSummary";
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
      {project.status === "submitted" ? (
        <AdminProjectCommercialReviewBanner
          projectId={project.id}
          approvalBlockedReason={project.pricingApprovalBlockedReason ?? undefined}
        />
      ) : null}

      <AdminProjectItemsPanel
        projectId={project.id}
        rooms={project.rooms}
        items={project.items}
        productThumbnailsById={project.productThumbnailsById}
        isEditable={isEditable}
        onAddRoom={isEditable ? () => setCreateRoomOpen(true) : undefined}
        onAddProduct={isEditable ? () => setAddProductOpen(true) : undefined}
      />

      <AdminProjectWorkspaceBottomSummary project={project} />

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
