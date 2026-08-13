import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectMessageReadMarker from "@/components/project-messages/ProjectMessageReadMarker/ProjectMessageReadMarker";
import ProjectMessageThread from "@/components/project-messages/ProjectMessageThread/ProjectMessageThread";
import {
  markProfessionalProjectMessagesReadAction,
  sendProfessionalProjectMessageAction,
} from "@/app/professional/projects/message-actions";
import { requireProfessional } from "@/lib/auth/authorization";
import { isProjectReadOnly } from "@/lib/projects/assertProjectEditable";
import { hasEverBeenSubmitted } from "@/lib/projects/project-review-history";
import { getProjectMessages } from "@/lib/project-messages/getProjectMessages";
import {
  getOwnedProjectDetailView,
  loadProductViewsByIds,
} from "@/lib/projects/project-queries";
import InternalPage from "@/components/internal/InternalPage/InternalPage";
import InternalPageHeader from "@/components/internal/InternalPageHeader/InternalPageHeader";
import InternalDetailSection from "@/components/internal/InternalDetailSection/InternalDetailSection";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { mapProjectStatusToBadge } from "@/lib/ui/map-status-badge";
import ProjectForm from "@/components/professional/projects/ProjectForm/ProjectForm";
import ProjectItemsList from "@/components/professional/projects/ProjectItemsList/ProjectItemsList";
import ProjectReviewHistory from "@/components/professional/projects/ProjectReviewHistory/ProjectReviewHistory";
import ProjectStatusBanner from "@/components/professional/projects/ProjectStatusBanner/ProjectStatusBanner";
import ProjectSubmitButton from "@/components/professional/projects/ProjectSubmitButton/ProjectSubmitButton";
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
}: PageProps<"/professional/projects/[id]">) {
  const user = await requireProfessional();
  const { id } = await params;
  const project = await getOwnedProjectDetailView(user.id, id);

  if (!project) {
    notFound();
  }

  const productIds = [...new Set(project.items.map((item) => item.productId))];
  const productViewsById = await loadProductViewsByIds(productIds);
  const readOnly = isProjectReadOnly(project.status);
  const showDelete =
    project.status === "draft" &&
    !hasEverBeenSubmitted({
      reviewHistory: project.reviewHistory.map((entry) => ({
        action: entry.action,
      })),
    });
  const messagingAvailable = hasEverBeenSubmitted({
    reviewHistory: project.reviewHistory.map((entry) => ({
      action: entry.action,
    })),
  });
  const messageThread = await getProjectMessages(user.id, "professional", id);
  const statusBadge = mapProjectStatusToBadge(project.status);
  const metaParts = [
    project.clientName,
    project.location,
    statusBadge.label,
  ].filter(Boolean);

  return (
    <InternalPage width="default">
      <InternalPageHeader
        title={project.name}
        description={metaParts.join(" · ") || undefined}
        actions={
          !readOnly ? (
            <Button href="/products" variant="secondary" size="sm">
              הוספת מוצרים
            </Button>
          ) : undefined
        }
      >
        <div className={styles.metaStrip}>
          <StatusBadge tone={statusBadge.tone}>{statusBadge.label}</StatusBadge>
        </div>
      </InternalPageHeader>

      <ProjectStatusBanner
        status={project.status}
        reviewHistory={project.reviewHistory}
        submittedAt={project.submittedAt}
      />

      <ProjectSubmitButton
        projectId={project.id}
        status={project.status}
        itemCount={project.items.length}
      />

      {/* Future quote/pricing section belongs between items and review history. */}

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
          showDelete={showDelete}
          readOnly={readOnly}
        />
      </InternalDetailSection>

      <InternalDetailSection id="project-items" title="מוצרים בפרויקט">
        <ProjectItemsList
          projectId={project.id}
          items={project.items}
          productViewsById={productViewsById}
          readOnly={readOnly}
        />
      </InternalDetailSection>

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
