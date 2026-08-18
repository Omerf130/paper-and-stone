import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireProfessional } from "@/lib/auth/authorization";
import { isProjectReadOnly } from "@/lib/projects/assertProjectEditable";
import { getProjectMessages } from "@/lib/project-messages/getProjectMessages";
import {
  getOwnedProjectDetailView,
  loadProductViewsByIds,
} from "@/lib/projects/project-queries";
import { loadProductThumbnailMap } from "@/lib/products/loadProductThumbnailMap";
import { getProfessionalQuoteSectionView } from "@/lib/quotes/quote-queries";
import { isMessagingAvailable } from "@/lib/projects/project-workspace-gates";
import InternalPage from "@/components/internal/InternalPage/InternalPage";
import InternalPageHeader from "@/components/internal/InternalPageHeader/InternalPageHeader";
import InternalDetailSection from "@/components/internal/InternalDetailSection/InternalDetailSection";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import {
  mapOnboardingStatusToBadge,
  mapProjectStatusToBadge,
} from "@/lib/ui/map-status-badge";
import ProjectForm from "@/components/professional/projects/ProjectForm/ProjectForm";
import ProjectItemsList from "@/components/professional/projects/ProjectItemsList/ProjectItemsList";
import ProjectRoomWorkspace from "@/components/professional/projects/ProjectRoomWorkspace/ProjectRoomWorkspace";
import ArchitectProjectWorkspace from "@/components/professional/projects/ArchitectProjectWorkspace/ArchitectProjectWorkspace";
import ProjectResubmitOnboardingButton from "@/components/professional/projects/ProjectResubmitOnboardingButton/ProjectResubmitOnboardingButton";
import ProjectReviewHistory from "@/components/professional/projects/ProjectReviewHistory/ProjectReviewHistory";
import ProjectStatusBanner from "@/components/professional/projects/ProjectStatusBanner/ProjectStatusBanner";
import ProjectSubmitButton from "@/components/professional/projects/ProjectSubmitButton/ProjectSubmitButton";
import ProfessionalQuoteSection from "@/components/professional/projects/ProfessionalQuoteSection/ProfessionalQuoteSection";
import {
  markProfessionalProjectMessagesReadAction,
  sendProfessionalProjectMessageAction,
} from "@/app/professional/projects/message-actions";
import ProjectMessageReadMarker from "@/components/project-messages/ProjectMessageReadMarker/ProjectMessageReadMarker";
import ProjectMessageThread from "@/components/project-messages/ProjectMessageThread/ProjectMessageThread";
import styles from "./page.module.scss";

export async function generateMetadata({
  params,
}: PageProps<"/professional/projects/[id]">): Promise<Metadata> {
  const user = await requireProfessional();
  const { id } = await params;
  const project = await getOwnedProjectDetailView(user.id, id);

  return {
    title: project
      ? `${project.name} | Paper & Stone`
      : "פרויקט | Paper & Stone",
  };
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: PageProps<"/professional/projects/[id]">) {
  const user = await requireProfessional();
  const { id } = await params;
  const { room } = await searchParams;
  const selectedRoomId = typeof room === "string" ? room : undefined;
  const project = await getOwnedProjectDetailView(user.id, id, selectedRoomId);

  if (!project) {
    notFound();
  }

  const productIds = [...new Set(project.items.map((item) => item.productId))];
  const productViewsById = await loadProductViewsByIds(productIds);
  const productThumbnailsById = await loadProductThumbnailMap(productIds);
  const itemsReadOnly = project.usesRoomBasedWorkspace
    ? !project.isRoomEditable
    : isProjectReadOnly(project.status);
  const isLegacyProject = project.onboardingStatus == null;
  const useArchitectWorkspace =
    project.onboardingStatus === "active" &&
    project.usesRoomBasedWorkspace &&
    (project.pricingSettings?.usesLayeredPricing ?? false);
  const messagingAvailable = isMessagingAvailable({
    status: project.status,
    onboardingStatus: project.onboardingStatus ?? undefined,
    reviewHistory: project.reviewHistory,
  });
  const messageThread = await getProjectMessages(user.id, "professional", id);
  const quoteSection =
    project.isItemWorkspaceVisible && !project.usesRoomBasedWorkspace
      ? await getProfessionalQuoteSectionView(user.id, id)
      : null;
  const statusBadge = mapProjectStatusToBadge(project.status);
  const onboardingBadge = project.onboardingStatus
    ? mapOnboardingStatusToBadge(project.onboardingStatus)
    : null;
  const metaParts = [
    project.onboardingStatus == null ? project.clientName : project.assignedClientFullName,
    project.location,
    onboardingBadge?.label ?? statusBadge.label,
  ].filter(Boolean);

  return (
    <InternalPage width="default">
      <InternalPageHeader
        title={project.name}
        description={metaParts.join(" · ") || undefined}
        actions={
          project.isItemWorkspaceVisible &&
          !itemsReadOnly &&
          !project.usesRoomBasedWorkspace ? (
            <Button href="/products" variant="secondary" size="sm">
              הוספת מוצרים
            </Button>
          ) : undefined
        }
      >
        <div className={styles.metaStrip}>
          {onboardingBadge ? (
            <StatusBadge tone={onboardingBadge.tone}>
              {onboardingBadge.label}
            </StatusBadge>
          ) : (
            <StatusBadge tone={statusBadge.tone}>{statusBadge.label}</StatusBadge>
          )}
        </div>
      </InternalPageHeader>

      <ProjectStatusBanner
        status={project.status}
        onboardingStatus={project.onboardingStatus}
        assignedClientFullName={project.assignedClientFullName}
        onboardingRejectionReason={project.onboardingRejectionReason}
        reviewHistory={project.reviewHistory}
        submittedAt={project.submittedAt}
      />

      {project.canResubmitOnboarding ? (
        <ProjectResubmitOnboardingButton projectId={project.id} />
      ) : null}

      {project.isItemWorkspaceVisible ? (
        <ProjectSubmitButton
          projectId={project.id}
          status={project.status}
          itemCount={project.items.length}
        />
      ) : null}

      <InternalDetailSection id="project-overview" title="פרטי פרויקט">
        <ProjectForm
          mode="edit"
          projectId={project.id}
          initialProject={{
            name: project.name,
            clientName: project.clientName ?? "",
            location: project.location ?? "",
            description: project.description ?? "",
          }}
          showDelete={project.isOnboardingDeletable}
          readOnly={!project.isMetadataEditable}
          showClientName={isLegacyProject}
        />
      </InternalDetailSection>

      {project.isItemWorkspaceVisible ? (
        useArchitectWorkspace ? (
          <InternalDetailSection id="project-workspace" title="מרחב העבודה">
            <ArchitectProjectWorkspace
              project={project}
              productViewsById={productViewsById}
              productThumbnailsById={productThumbnailsById}
              readOnly={itemsReadOnly}
            />
          </InternalDetailSection>
        ) : (
          <InternalDetailSection id="project-items" title="מוצרים בפרויקט">
            {project.usesRoomBasedWorkspace ? (
              <Suspense fallback={null}>
                <ProjectRoomWorkspace
                  project={project}
                  productViewsById={productViewsById}
                  readOnly={itemsReadOnly}
                />
              </Suspense>
            ) : (
              <ProjectItemsList
                projectId={project.id}
                items={project.items}
                productViewsById={productViewsById}
                readOnly={itemsReadOnly}
              />
            )}
          </InternalDetailSection>
        )
      ) : null}

      {quoteSection ? (
        <InternalDetailSection id="project-quote" title="הצעת מחיר">
          <ProfessionalQuoteSection section={quoteSection} />
        </InternalDetailSection>
      ) : null}

      {project.reviewHistory.length > 0 ? (
        <InternalDetailSection
          id="project-history"
          title="היסטוריית שליחה ובדיקה"
        >
          <ProjectReviewHistory history={project.reviewHistory} />
        </InternalDetailSection>
      ) : null}

      <ProjectMessageReadMarker
        projectId={project.id}
        messagingAvailable={messagingAvailable}
        markReadAction={markProfessionalProjectMessagesReadAction}
      />

      <InternalDetailSection id="messages" title="שיחה על הפרויקט">
        <ProjectMessageThread
          projectId={project.id}
          messages={messageThread.messages}
          messagingAvailable={messagingAvailable}
          truncated={messageThread.truncated}
          sendAction={sendProfessionalProjectMessageAction}
          hideTitle
        />
      </InternalDetailSection>
    </InternalPage>
  );
}
