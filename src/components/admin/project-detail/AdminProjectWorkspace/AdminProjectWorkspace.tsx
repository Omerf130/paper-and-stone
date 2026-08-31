"use client";

import { Suspense, useSyncExternalStore } from "react";
import AdminProjectWorkspaceHeader from "@/components/admin/project-detail/AdminProjectWorkspaceHeader/AdminProjectWorkspaceHeader";
import AdminProjectWorkspaceTabs from "@/components/admin/project-detail/AdminProjectWorkspaceTabs/AdminProjectWorkspaceTabs";
import type { AdminProjectDetailWithThumbnails } from "@/lib/projects/getAdminProjects";
import type { AdminProjectTabId } from "@/lib/projects/admin-project-tab-params";
import styles from "./AdminProjectWorkspace.module.scss";

type AdminProjectWorkspaceProps = {
  project: AdminProjectDetailWithThumbnails;
  initialTabId?: AdminProjectTabId;
};

function useClientMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function AdminProjectWorkspace({
  project,
  initialTabId,
}: AdminProjectWorkspaceProps) {
  const mounted = useClientMounted();

  if (!mounted) {
    return (
      <div className={styles.workspace}>
        <p className={styles.loading}>טוען...</p>
      </div>
    );
  }

  return (
    <div className={styles.workspace}>
      <AdminProjectWorkspaceHeader project={project} />
      <Suspense fallback={<p className={styles.loading}>טוען...</p>}>
        <AdminProjectWorkspaceTabs
          project={project}
          initialTabId={initialTabId}
        />
      </Suspense>
    </div>
  );
}
