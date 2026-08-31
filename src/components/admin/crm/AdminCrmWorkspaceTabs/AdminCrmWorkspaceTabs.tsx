import Link from "next/link";
import styles from "@/components/admin/list/admin-list-toolbar.module.scss";

export type AdminCrmWorkspace = "clients" | "architects";
export type AdminCrmWorkspaceTab = "list" | "requests";

type AdminCrmWorkspaceTabsProps = {
  workspace: AdminCrmWorkspace;
  activeTab: AdminCrmWorkspaceTab;
  listHref?: string;
  pendingRequestCount?: number;
};

const WORKSPACE_CONFIG: Record<
  AdminCrmWorkspace,
  {
    ariaLabel: string;
    listLabel: string;
    listHref: string;
    requestsHref: string;
  }
> = {
  clients: {
    ariaLabel: "תצוגות לקוחות",
    listLabel: "כל הלקוחות",
    listHref: "/admin/clients",
    requestsHref: "/admin/client-requests",
  },
  architects: {
    ariaLabel: "תצוגות אדריכלים",
    listLabel: "כל האדריכלים",
    listHref: "/admin/architects",
    requestsHref: "/admin/architect-requests",
  },
};

function formatRequestsLabel(count: number): string {
  return count > 0 ? `בקשות (${count})` : "בקשות";
}

export default function AdminCrmWorkspaceTabs({
  workspace,
  activeTab,
  listHref,
  pendingRequestCount = 0,
}: AdminCrmWorkspaceTabsProps) {
  const config = WORKSPACE_CONFIG[workspace];
  const resolvedListHref = listHref ?? config.listHref;
  const requestsLabel = formatRequestsLabel(pendingRequestCount);

  return (
    <nav className={styles.queueTabs} aria-label={config.ariaLabel}>
      <Link
        href={resolvedListHref}
        className={activeTab === "list" ? styles.queueTabActive : styles.queueTab}
        aria-current={activeTab === "list" ? "page" : undefined}
      >
        {config.listLabel}
      </Link>
      <Link
        href={config.requestsHref}
        className={
          activeTab === "requests" ? styles.queueTabActive : styles.queueTab
        }
        aria-current={activeTab === "requests" ? "page" : undefined}
      >
        {requestsLabel}
      </Link>
    </nav>
  );
}
