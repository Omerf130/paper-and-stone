import type { ReactNode } from "react";
import AdminCrmWorkspaceTabs, {
  type AdminCrmWorkspace,
  type AdminCrmWorkspaceTab,
} from "@/components/admin/crm/AdminCrmWorkspaceTabs/AdminCrmWorkspaceTabs";
import styles from "@/components/admin/list/admin-list-toolbar.module.scss";

type AdminCrmTabSectionProps = {
  workspace: AdminCrmWorkspace;
  activeTab: AdminCrmWorkspaceTab;
  listHref?: string;
  pendingRequestCount?: number;
  summary?: string;
  children?: ReactNode;
};

export default function AdminCrmTabSection({
  workspace,
  activeTab,
  listHref,
  pendingRequestCount,
  summary,
  children,
}: AdminCrmTabSectionProps) {
  return (
    <section className={styles.toolbar} aria-label={workspace === "clients" ? "לקוחות" : "אדריכלים"}>
      <AdminCrmWorkspaceTabs
        workspace={workspace}
        activeTab={activeTab}
        listHref={listHref}
        pendingRequestCount={pendingRequestCount}
      />
      {children}
      {summary ? <p className={styles.summary}>{summary}</p> : null}
    </section>
  );
}
