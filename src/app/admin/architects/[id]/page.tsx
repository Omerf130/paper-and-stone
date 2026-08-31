import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import AdminArchitectProfileForm from "@/components/admin/crm/AdminArchitectProfileForm/AdminArchitectProfileForm";
import AdminCrmProjectsTable from "@/components/admin/crm/AdminCrmProjectsTable/AdminCrmProjectsTable";
import AdminDetailSection from "@/components/admin/project-detail/AdminDetailSection/AdminDetailSection";
import cardStyles from "@/components/admin/list/admin-list-card.module.scss";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { getAdminCrmProjectsForArchitect } from "@/lib/admin/crm/getAdminCrmProjects";
import { getAdminArchitectDetail } from "@/lib/admin/architects/getAdminArchitects";
import { toProfileFormInput } from "@/lib/professionals/profile-completeness";
import { formatDateTime } from "@/lib/ui/format-date-time";
import { mapEntityActiveToBadge } from "@/lib/ui/map-status-badge";

type AdminArchitectDetailPageProps = PageProps<"/admin/architects/[id]">;

export async function generateMetadata({
  params,
}: AdminArchitectDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const architect = await getAdminArchitectDetail(id);

  return {
    title: architect
      ? `${architect.fullName ?? architect.email} | אדריכלים | Paper & Stone`
      : "אדריכל | Paper & Stone",
  };
}

export default async function AdminArchitectDetailPage({
  params,
}: AdminArchitectDetailPageProps) {
  const { id } = await params;
  const architect = await getAdminArchitectDetail(id);

  if (!architect) {
    notFound();
  }

  const projects = await getAdminCrmProjectsForArchitect(architect.id);
  const activeStatus = mapEntityActiveToBadge(architect.isActive);

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title={architect.fullName ?? architect.email}
        description="פרופיל אדריכל ופרויקטים"
        actions={
          <>
            <Button
              href={`/admin/projects/new?architectId=${architect.id}`}
              size="sm"
            >
              פרויקט חדש
            </Button>
            <Button
              href={`/admin/users?q=${encodeURIComponent(architect.email)}`}
              variant="secondary"
              size="sm"
            >
              משתמשים
            </Button>
            <Button href="/admin/architects" variant="ghost" size="sm">
              חזרה לאדריכלים
            </Button>
          </>
        }
      />

      <AdminDetailSection id="architect-metadata" title="פרטי חשבון">
        <div className={cardStyles.metaGrid}>
          <div className={cardStyles.metaRow}>
            <span className={cardStyles.metaLabel}>אימייל:</span>
            <span className={cardStyles.metaValue} dir="ltr">
              {architect.email}
            </span>
          </div>
          <div className={cardStyles.metaRow}>
            <span className={cardStyles.metaLabel}>ח.פ / ת.ז:</span>
            <span className={cardStyles.metaValue}>
              {architect.identificationNumber ?? "—"}
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
            <span className={cardStyles.metaValue}>{architect.projectCount}</span>
          </div>
          <div className={cardStyles.metaRow}>
            <span className={cardStyles.metaLabel}>נרשם:</span>
            <span className={cardStyles.metaValue}>
              {formatDateTime(architect.createdAt)}
            </span>
          </div>
          <div className={cardStyles.metaRow}>
            <span className={cardStyles.metaLabel}>עודכן:</span>
            <span className={cardStyles.metaValue}>
              {formatDateTime(architect.updatedAt)}
            </span>
          </div>
        </div>
      </AdminDetailSection>

      <AdminDetailSection id="architect-profile" title="פרופיל מקצועי">
        <AdminArchitectProfileForm
          architectId={architect.id}
          initialProfile={toProfileFormInput(architect.profile)}
        />
      </AdminDetailSection>

      <AdminDetailSection
        id="architect-projects"
        title="פרויקטים"
        description={`${projects.length} פרויקטים בבעלות האדריכל`}
      >
        <AdminCrmProjectsTable
          projects={projects}
          showClient
          emptyMessage="אין פרויקטים לאדריכל זה."
        />
      </AdminDetailSection>
    </AdminPage>
  );
}
