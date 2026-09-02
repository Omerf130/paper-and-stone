"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Tabs from "@/components/ui/Tabs/Tabs";
import AdminProjectSummaryTab from "@/components/admin/project-detail/AdminProjectSummaryTab/AdminProjectSummaryTab";
import AdminProjectCostsTab from "@/components/admin/project-detail/AdminProjectCostsTab/AdminProjectCostsTab";
import AdminProjectPaymentsTab from "@/components/admin/project-detail/AdminProjectPaymentsTab/AdminProjectPaymentsTab";
import AdminProjectImportTab from "@/components/admin/project-detail/AdminProjectImportTab/AdminProjectImportTab";
import AdminProjectHistoryTab from "@/components/admin/project-detail/AdminProjectHistoryTab/AdminProjectHistoryTab";
import type { AdminProjectDetailWithThumbnails } from "@/lib/projects/getAdminProjects";
import {
  ADMIN_PROJECT_TAB_LABELS,
  isAdminProjectTabId,
  type AdminProjectTabId,
} from "@/lib/projects/admin-project-tab-params";
import styles from "./AdminProjectWorkspaceTabs.module.scss";

type AdminProjectWorkspaceTabsProps = {
  project: AdminProjectDetailWithThumbnails;
  initialTabId?: AdminProjectTabId;
};

export default function AdminProjectWorkspaceTabs({
  project,
  initialTabId = "summary",
}: AdminProjectWorkspaceTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTabId: AdminProjectTabId = isAdminProjectTabId(tabParam)
    ? tabParam
    : initialTabId;

  const handleTabChange = useCallback(
    (tabId: string) => {
      if (!isAdminProjectTabId(tabId)) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const tabItems = useMemo(
    () => [
      {
        id: "summary",
        label: ADMIN_PROJECT_TAB_LABELS.summary,
        panel: <AdminProjectSummaryTab project={project} />,
      },
      {
        id: "costs",
        label: ADMIN_PROJECT_TAB_LABELS.costs,
        panel: <AdminProjectCostsTab project={project} />,
      },
      {
        id: "payments",
        label: ADMIN_PROJECT_TAB_LABELS.payments,
        panel: <AdminProjectPaymentsTab project={project} />,
      },
      {
        id: "import",
        label: ADMIN_PROJECT_TAB_LABELS.import,
        panel: <AdminProjectImportTab project={project} />,
      },
      {
        id: "history",
        label: ADMIN_PROJECT_TAB_LABELS.history,
        panel: <AdminProjectHistoryTab project={project} />,
      },
    ],
    [project],
  );

  return (
    <div className={styles.tabsWrap}>
      <Tabs
        items={tabItems}
        activeTabId={activeTabId}
        onTabChange={handleTabChange}
        ariaLabel="עבודת פרויקט מנהל"
        density="compact"
      />
    </div>
  );
}
