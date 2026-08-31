import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import AdminCrmProjectsTable from "@/components/admin/crm/AdminCrmProjectsTable/AdminCrmProjectsTable";
import AdminDetailSection from "@/components/admin/project-detail/AdminDetailSection/AdminDetailSection";
import cardStyles from "@/components/admin/list/admin-list-card.module.scss";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { getAdminCrmProjectsForClient } from "@/lib/admin/crm/getAdminCrmProjects";
import { getAdminClientDetail } from "@/lib/admin/clients/getAdminClients";
import { formatDateTime } from "@/lib/ui/format-date-time";
import { mapAccountStatusToBadge } from "@/lib/ui/map-account-status-badge";
import { mapEntityActiveToBadge } from "@/lib/ui/map-status-badge";

type AdminClientDetailPageProps = PageProps<"/admin/clients/[id]">;

export async function generateMetadata({
  params,
}: AdminClientDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const client = await getAdminClientDetail(id);

  return {
    title: client
      ? `${client.fullName ?? client.email} | לקוחות | Paper & Stone`
      : "לקוח | Paper & Stone",
  };
}

export default async function AdminClientDetailPage({
  params,
}: AdminClientDetailPageProps) {
  const { id } = await params;
  const client = await getAdminClientDetail(id);

  if (!client) {
    notFound();
  }

  const projects = await getAdminCrmProjectsForClient(client.id);
  const activeStatus = mapEntityActiveToBadge(client.isActive);
  const accountStatus = mapAccountStatusToBadge(client.accountStatus);

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title={client.fullName ?? client.email}
        description="פרטי לקוח ופרויקטים משויכים"
        actions={
          <>
            <Button
              href={`/admin/projects/new?clientId=${client.id}`}
              size="sm"
            >
              פרויקט חדש
            </Button>
            <Button
              href={`/admin/users?q=${encodeURIComponent(client.email)}`}
              variant="secondary"
              size="sm"
            >
              משתמשים
            </Button>
            <Button href="/admin/clients" variant="ghost" size="sm">
              חזרה ללקוחות
            </Button>
          </>
        }
      />

      <AdminDetailSection id="client-metadata" title="פרטי לקוח">
        <div className={cardStyles.metaGrid}>
          <div className={cardStyles.metaRow}>
            <span className={cardStyles.metaLabel}>אימייל:</span>
            <span className={cardStyles.metaValue} dir="ltr">
              {client.email}
            </span>
          </div>
          <div className={cardStyles.metaRow}>
            <span className={cardStyles.metaLabel}>ח.פ / ת.ז:</span>
            <span className={cardStyles.metaValue}>
              {client.identificationNumber ?? "—"}
            </span>
          </div>
          <div className={cardStyles.metaRow}>
            <span className={cardStyles.metaLabel}>סטטוס חשבון:</span>
            <span className={cardStyles.metaValue}>
              <StatusBadge tone={accountStatus.tone}>
                {accountStatus.label}
              </StatusBadge>
            </span>
          </div>
          <div className={cardStyles.metaRow}>
            <span className={cardStyles.metaLabel}>פעילות:</span>
            <span className={cardStyles.metaValue}>
              <StatusBadge tone={activeStatus.tone}>
                {activeStatus.label}
              </StatusBadge>
            </span>
          </div>
          <div className={cardStyles.metaRow}>
            <span className={cardStyles.metaLabel}>פרויקטים:</span>
            <span className={cardStyles.metaValue}>{client.projectCount}</span>
          </div>
          <div className={cardStyles.metaRow}>
            <span className={cardStyles.metaLabel}>נרשם:</span>
            <span className={cardStyles.metaValue}>
              {formatDateTime(client.createdAt)}
            </span>
          </div>
          <div className={cardStyles.metaRow}>
            <span className={cardStyles.metaLabel}>עודכן:</span>
            <span className={cardStyles.metaValue}>
              {formatDateTime(client.updatedAt)}
            </span>
          </div>
        </div>
      </AdminDetailSection>

      <AdminDetailSection
        id="client-projects"
        title="פרויקטים"
        description={`${projects.length} פרויקטים משויכים ללקוח`}
      >
        <AdminCrmProjectsTable
          projects={projects}
          showArchitect
          emptyMessage="אין פרויקטים משויכים ללקוח זה."
        />
      </AdminDetailSection>
    </AdminPage>
  );
}
